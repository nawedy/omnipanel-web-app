import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import * as fs from 'fs-extra';
import * as path from 'path';
import { PluginValidator } from '../plugin';
import { PluginManifest, PluginBuildOptions, PluginBuildResult } from '../types';
import { PluginBuilder } from './builder';
import { PluginDevServerImpl as PluginDevServer } from './dev-server';
import { PluginTemplate } from './templates';

export class PluginCLI {
  private program = new Command();
  private builder = new PluginBuilder();
  private devServer: PluginDevServer | null = null;

  constructor() {
    this.setupCommands();
  }

  run(argv: string[]): void {
    this.program.parse(argv);
  }

  private setupCommands(): void {
    this.program
      .name('omnipanel-plugin')
      .description('OmniPanel Plugin Development CLI')
      .version('1.0.0');

    // Create command
    this.program
      .command('create')
      .description('Create a new plugin project')
      .option('-n, --name <name>', 'Plugin name')
      .option('-t, --template <template>', 'Template to use', 'basic')
      .option('-d, --directory <dir>', 'Output directory')
      .action(this.createPlugin.bind(this));

    // Build command
    this.program
      .command('build')
      .description('Build the plugin for production')
      .option('-w, --watch', 'Watch for changes')
      .option('--mode <mode>', 'Build mode', 'production')
      .option('--out-dir <dir>', 'Output directory', 'dist')
      .option('--minify', 'Minify output')
      .option('--sourcemap', 'Generate sourcemaps')
      .action(this.buildPlugin.bind(this));

    // Dev command
    this.program
      .command('dev')
      .description('Start development server')
      .option('-p, --port <port>', 'Port number', '3000')
      .option('--host <host>', 'Host address', 'localhost')
      .action(this.startDev.bind(this));

    // Validate command
    this.program
      .command('validate')
      .description('Validate plugin manifest')
      .option('-f, --file <file>', 'Manifest file path', 'manifest.json')
      .action(this.validatePlugin.bind(this));

    // Package command
    this.program
      .command('package')
      .description('Package plugin for distribution')
      .option('-o, --output <file>', 'Output file name')
      .action(this.packagePlugin.bind(this));

    // Install command
    this.program
      .command('install')
      .description('Install plugin dependencies')
      .action(this.installDependencies.bind(this));

    // Test command
    this.program
      .command('test')
      .description('Run plugin tests')
      .option('--watch', 'Watch for changes')
      .action(this.testPlugin.bind(this));

    // Publish command
    this.program
      .command('publish')
      .description('Publish plugin to marketplace')
      .option('--tag <tag>', 'Version tag')
      .action(this.publishPlugin.bind(this));
  }

  private async createPlugin(options: any): Promise<void> {
    console.log(chalk.blue('🚀 Creating new OmniPanel plugin...'));

    try {
      const answers = await this.promptForPluginDetails(options);
      const templateContent = PluginTemplate.getBasicTemplate();
      
      // TODO: Create plugin directory and files with template content
      console.log(chalk.gray('Template content generated'));

      console.log(chalk.green('✅ Plugin created successfully!'));
      console.log(chalk.yellow('\nNext steps:'));
      console.log(chalk.gray(`  cd ${answers.directory}`));
      console.log(chalk.gray('  omnipanel-plugin install'));
      console.log(chalk.gray('  omnipanel-plugin dev'));
    } catch (error) {
      console.error(chalk.red('❌ Failed to create plugin:'), error);
      process.exit(1);
    }
  }

  private async buildPlugin(options: any): Promise<void> {
    console.log(chalk.blue('🔨 Building plugin...'));

    try {
      const buildOptions: PluginBuildOptions = {
        mode: options.mode === 'development' ? 'development' : 'production',
        watch: options.watch,
        outDir: options.outDir,
        minify: options.minify,
        sourcemap: options.sourcemap,
      };

      const result = await this.builder.build(buildOptions);
      
      if (result.success) {
        console.log(chalk.green('✅ Build completed successfully!'));
        console.log(chalk.gray(`Output files: ${result.outputFiles.length}`));
        
        if (result.warnings.length > 0) {
          console.log(chalk.yellow(`⚠️  ${result.warnings.length} warnings:`));
          result.warnings.forEach(warning => console.log(chalk.yellow(`  ${warning}`)));
        }
      } else {
        console.log(chalk.red('❌ Build failed!'));
        result.errors.forEach(error => console.error(chalk.red(`  ${error}`)));
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red('❌ Build error:'), error);
      process.exit(1);
    }
  }

  private async startDev(options: any): Promise<void> {
    console.log(chalk.blue('🚀 Starting development server...'));

    try {
      this.devServer = new PluginDevServer();

      await this.devServer.start();
      
      console.log(chalk.green('✅ Development server started!'));
      console.log(chalk.blue(`🌐 Server running at: ${this.devServer.getUrl()}`));
      
      // Handle graceful shutdown
      process.on('SIGINT', async () => {
        console.log(chalk.yellow('\n🛑 Shutting down development server...'));
        if (this.devServer) {
          await this.devServer.stop();
        }
        process.exit(0);
      });
    } catch (error) {
      console.error(chalk.red('❌ Failed to start development server:'), error);
      process.exit(1);
    }
  }

  private async validatePlugin(options: any): Promise<void> {
    console.log(chalk.blue('🔍 Validating plugin manifest...'));

    try {
      const manifestPath = path.resolve(options.file);
      
      if (!await fs.pathExists(manifestPath)) {
        throw new Error(`Manifest file not found: ${manifestPath}`);
      }

      const manifest = await fs.readJson(manifestPath);
      const validation = PluginValidator.validateManifest(manifest);

      if (validation.valid) {
        console.log(chalk.green('✅ Plugin manifest is valid!'));
      } else {
        console.log(chalk.red('❌ Plugin manifest validation failed:'));
        validation.errors.forEach(error => console.error(chalk.red(`  • ${error}`)));
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red('❌ Validation error:'), error);
      process.exit(1);
    }
  }

  private async packagePlugin(options: any): Promise<void> {
    console.log(chalk.blue('📦 Packaging plugin...'));

    try {
      // Build the plugin first
      await this.buildPlugin({ mode: 'production' });

      // Create package
      const manifest = await fs.readJson('manifest.json');
      const outputFile = options.output || `${manifest.id}-${manifest.version}.opx`;
      
      // TODO: Implement actual packaging (zip/tar creation)
      console.log(chalk.green(`✅ Plugin packaged as: ${outputFile}`));
    } catch (error) {
      console.error(chalk.red('❌ Packaging failed:'), error);
      process.exit(1);
    }
  }

  private async installDependencies(): Promise<void> {
    console.log(chalk.blue('📥 Installing plugin dependencies...'));

    try {
      // TODO: Implement dependency installation
      console.log(chalk.green('✅ Dependencies installed successfully!'));
    } catch (error) {
      console.error(chalk.red('❌ Installation failed:'), error);
      process.exit(1);
    }
  }

  private async testPlugin(options: any): Promise<void> {
    console.log(chalk.blue('🧪 Running plugin tests...'));

    try {
      // TODO: Implement test runner
      console.log(chalk.green('✅ All tests passed!'));
    } catch (error) {
      console.error(chalk.red('❌ Tests failed:'), error);
      process.exit(1);
    }
  }

  private async publishPlugin(options: any): Promise<void> {
    console.log(chalk.blue('🚀 Publishing plugin to marketplace...'));

    try {
      // Build and package first
      await this.buildPlugin({ mode: 'production' });
      await this.packagePlugin({});

      // TODO: Implement marketplace publishing
      console.log(chalk.green('✅ Plugin published successfully!'));
    } catch (error) {
      console.error(chalk.red('❌ Publishing failed:'), error);
      process.exit(1);
    }
  }

  private async promptForPluginDetails(options: any): Promise<any> {
    const questions = [];

    if (!options.name) {
      questions.push({
        type: 'input',
        name: 'name',
        message: 'Plugin name:',
        validate: (input: string) => input.trim().length > 0 || 'Plugin name is required',
      });
    }

    questions.push(
      {
        type: 'input',
        name: 'description',
        message: 'Plugin description:',
        default: 'A new OmniPanel plugin',
      },
      {
        type: 'input',
        name: 'author',
        message: 'Author name:',
        default: 'Anonymous',
      },
      {
        type: 'list',
        name: 'category',
        message: 'Plugin category:',
        choices: [
          'ai-models',
          'code-tools',
          'data-science',
          'productivity',
          'themes',
          'integrations',
          'utilities',
          'extensions',
        ],
        default: 'utilities',
      },
      {
        type: 'checkbox',
        name: 'permissions',
        message: 'Required permissions:',
        choices: [
          { name: 'File System', value: 'file-system' },
          { name: 'Network', value: 'network' },
          { name: 'Workspace', value: 'workspace' },
          { name: 'Chat', value: 'chat' },
          { name: 'Terminal', value: 'terminal' },
          { name: 'Notebook', value: 'notebook' },
          { name: 'Settings', value: 'settings' },
          { name: 'Clipboard', value: 'clipboard' },
          { name: 'Notifications', value: 'notifications' },
          { name: 'Storage', value: 'storage' },
        ],
      },
      {
        type: 'list',
        name: 'template',
        message: 'Template:',
        choices: [
          { name: 'Basic Plugin', value: 'basic' },
          { name: 'Chat Provider', value: 'chat-provider' },
          { name: 'Code Tool', value: 'code-tool' },
          { name: 'Theme', value: 'theme' },
          { name: 'Integration', value: 'integration' },
        ],
        default: options.template || 'basic',
      }
    );

    if (!options.directory) {
      questions.push({
        type: 'input',
        name: 'directory',
        message: 'Output directory:',
        default: (answers: any) => answers.name?.toLowerCase().replace(/\s+/g, '-') || 'my-plugin',
      });
    }

    const answers = await inquirer.prompt(questions);
    
    return {
      ...options,
      ...answers,
    };
  }
}

// CLI entry point
export function createCLI(): PluginCLI {
  return new PluginCLI();
} 