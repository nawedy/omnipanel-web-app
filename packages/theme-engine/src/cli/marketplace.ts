#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { MarketplaceClient, getMarketplaceClient } from '../marketplace/client';
import { CommunityManager, getCommunityManager } from '../community/manager';
import { validateTheme } from '../validator';
import { Theme } from '../types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * OmniPanel Theme Marketplace CLI
 * 
 * Commands:
 * - login: Authenticate with marketplace
 * - search: Search for themes
 * - install: Install a theme
 * - publish: Publish a theme to marketplace
 * - update: Update a published theme
 * - stats: View marketplace statistics
 * - community: Community management commands
 */

const program = new Command();

// Global configuration
let config: {
  apiKey?: string;
  userId?: string;
  baseUrl?: string;
} = {};

// Load configuration
async function loadConfig(): Promise<void> {
  try {
    const configPath = path.join(process.cwd(), '.omnipanel-theme-config.json');
    const configFile = await fs.readFile(configPath, 'utf-8');
    config = JSON.parse(configFile);
  } catch (error) {
    // Config file doesn't exist or is invalid - use defaults
    config = {
      baseUrl: 'https://marketplace.omnipanel.ai'
    };
  }
}

// Save configuration
async function saveConfig(): Promise<void> {
  try {
    const configPath = path.join(process.cwd(), '.omnipanel-theme-config.json');
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error(chalk.red('Failed to save configuration:'), error);
  }
}

// Initialize marketplace client
function getClient(): MarketplaceClient {
  return getMarketplaceClient({
    baseUrl: config.baseUrl || 'https://marketplace.omnipanel.ai',
    apiKey: config.apiKey,
    userId: config.userId
  });
}

// Initialize community manager
function getCommunity(): CommunityManager {
  return getCommunityManager({
    baseUrl: config.baseUrl?.replace('marketplace', 'community') || 'https://community.omnipanel.ai',
    apiKey: config.apiKey,
    userId: config.userId
  });
}

// Authentication command
program
  .command('login')
  .description('Authenticate with the OmniPanel marketplace')
  .action(async () => {
    console.log(chalk.blue('🔐 OmniPanel Marketplace Authentication'));
    
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'apiKey',
        message: 'Enter your API key:',
        validate: (input: string) => input.length > 0 || 'API key is required'
      },
      {
        type: 'input',
        name: 'userId',
        message: 'Enter your user ID:',
        validate: (input: string) => input.length > 0 || 'User ID is required'
      },
      {
        type: 'input',
        name: 'baseUrl',
        message: 'Marketplace URL (optional):',
        default: 'https://marketplace.omnipanel.ai'
      }
    ]);

    config = answers;
    await saveConfig();
    
    console.log(chalk.green('✅ Authentication successful!'));
  });

// Search themes command
program
  .command('search <query>')
  .description('Search for themes in the marketplace')
  .option('-c, --category <category>', 'Filter by category')
  .option('-t, --tags <tags>', 'Filter by tags (comma-separated)')
  .option('-a, --author <author>', 'Filter by author')
  .option('--sort <field>', 'Sort by field (downloads, rating, created, updated)', 'downloads')
  .option('--limit <number>', 'Number of results to show', '10')
  .action(async (query: string, options) => {
    await loadConfig();
    const client = getClient();
    const spinner = ora('Searching themes...').start();

    try {
      const results = await client.searchThemes({
        query,
        category: options.category,
        tags: options.tags?.split(','),
        author: options.author,
        sortBy: options.sort,
        limit: parseInt(options.limit)
      });

      spinner.stop();

      if (results.length === 0) {
        console.log(chalk.yellow('No themes found matching your search.'));
        return;
      }

      console.log(chalk.blue(`\n🎨 Found ${results.length} themes:\n`));

      results.forEach((theme, index) => {
        console.log(chalk.bold(`${index + 1}. ${theme.name}`));
        console.log(`   ${chalk.gray('ID:')} ${theme.id}`);
        console.log(`   ${chalk.gray('Author:')} ${theme.author.name}`);
        console.log(`   ${chalk.gray('Rating:')} ${theme.rating} (${theme.downloads} downloads)`);
        console.log(`   ${chalk.gray('Description:')} ${theme.description}`);
        console.log();
      });
    } catch (error) {
      spinner.stop();
      console.error(chalk.red('Search failed:'), error instanceof Error ? error.message : error);
    }
  });

// Install theme command
program
  .command('install <themeId>')
  .description('Install a theme from the marketplace')
  .option('--activate', 'Activate the theme after installation')
  .option('--overwrite', 'Overwrite existing theme')
  .action(async (themeId: string, options) => {
    await loadConfig();
    const client = getClient();
    const spinner = ora('Installing theme...').start();

    try {
      const theme = await client.installTheme(themeId, {
        activate: options.activate,
        overwrite: options.overwrite
      });

      spinner.stop();
      console.log(chalk.green(`✅ Theme "${theme.name}" installed successfully!`));
      
      if (options.activate) {
        console.log(chalk.blue('🎨 Theme has been activated.'));
      }
    } catch (error) {
      spinner.stop();
      console.error(chalk.red('Installation failed:'), error instanceof Error ? error.message : error);
    }
  });

// Publish theme command
program
  .command('publish <themePath>')
  .description('Publish a theme to the marketplace')
  .option('-n, --name <name>', 'Theme name')
  .option('-d, --description <description>', 'Theme description')
  .option('-c, --category <category>', 'Theme category')
  .option('-t, --tags <tags>', 'Theme tags (comma-separated)')
  .option('--price <price>', 'Theme price (0 for free)')
  .action(async (themePath: string, options) => {
    await loadConfig();
    
    if (!config.apiKey || !config.userId) {
      console.error(chalk.red('Please authenticate first using: omnipanel-theme login'));
      return;
    }

    const spinner = ora('Loading theme...').start();

    try {
      // Load and validate theme
      const themeFile = await fs.readFile(themePath, 'utf-8');
      const theme: Theme = JSON.parse(themeFile);
      
      const validation = validateTheme(theme);
      if (!validation.valid) {
        spinner.stop();
        console.error(chalk.red('Theme validation failed:'));
        validation.errors.forEach(error => {
          console.error(`  ${chalk.red('✗')} ${error.path}: ${error.message}`);
        });
        return;
      }

      spinner.text = 'Publishing theme...';

      // Get additional information if not provided
      let publishInfo = { ...options };
      
      if (!publishInfo.name || !publishInfo.description || !publishInfo.category) {
        spinner.stop();
        
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'name',
            message: 'Theme name:',
            default: theme.name,
            when: !publishInfo.name
          },
          {
            type: 'input',
            name: 'description',
            message: 'Theme description:',
            default: theme.description,
            when: !publishInfo.description
          },
          {
            type: 'list',
            name: 'category',
            message: 'Theme category:',
            choices: ['professional', 'creative', 'minimal', 'dark', 'light', 'accessibility', 'gaming'],
            when: !publishInfo.category
          },
          {
            type: 'input',
            name: 'tags',
            message: 'Tags (comma-separated):',
            when: !publishInfo.tags
          },
          {
            type: 'number',
            name: 'price',
            message: 'Price (0 for free):',
            default: 0,
            when: !publishInfo.price
          }
        ]);

        publishInfo = { ...publishInfo, ...answers };
        spinner.start('Publishing theme...');
      }

      const client = getClient();
      const submissionId = await client.submitTheme(theme, {
        name: publishInfo.name || theme.name,
        description: publishInfo.description || theme.description,
        category: publishInfo.category,
        tags: publishInfo.tags?.split(',') || [],
        price: parseFloat(publishInfo.price || '0'),
        visibility: 'public'
      });

      spinner.stop();
      console.log(chalk.green(`✅ Theme submitted successfully!`));
      console.log(chalk.blue(`📝 Submission ID: ${submissionId}`));
      console.log(chalk.gray('Your theme will be reviewed before being published.'));
    } catch (error) {
      spinner.stop();
      console.error(chalk.red('Publishing failed:'), error instanceof Error ? error.message : error);
    }
  });

// Update theme command
program
  .command('update <themeId>')
  .description('Update an installed theme')
  .action(async (themeId: string) => {
    await loadConfig();
    const client = getClient();
    const spinner = ora('Checking for updates...').start();

    try {
      const updatedTheme = await client.updateTheme(themeId);
      
      spinner.stop();
      console.log(chalk.green(`✅ Theme "${updatedTheme.name}" updated successfully!`));
    } catch (error) {
      spinner.stop();
      
      if (error instanceof Error && error.message.includes('No update available')) {
        console.log(chalk.blue('ℹ️ Theme is already up to date.'));
      } else {
        console.error(chalk.red('Update failed:'), error instanceof Error ? error.message : error);
      }
    }
  });

// Marketplace statistics command
program
  .command('stats')
  .description('View marketplace statistics')
  .action(async () => {
    await loadConfig();
    const client = getClient();
    const community = getCommunity();
    const spinner = ora('Loading statistics...').start();

    try {
      const [marketplaceStats, communityStats] = await Promise.all([
        client.getMarketplaceStats(),
        community.getCommunityStats()
      ]);

      spinner.stop();

      console.log(chalk.blue('\n📊 OmniPanel Marketplace Statistics\n'));
      console.log(`${chalk.bold('Themes:')} ${marketplaceStats.totalThemes.toLocaleString()}`);
      console.log(`${chalk.bold('Downloads:')} ${marketplaceStats.totalDownloads.toLocaleString()}`);
      console.log(`${chalk.bold('Active Users:')} ${marketplaceStats.activeUsers.toLocaleString()}`);
      console.log(`${chalk.bold('Theme Creators:')} ${marketplaceStats.totalCreators.toLocaleString()}`);
      
      console.log(chalk.blue('\n👥 Community Statistics\n'));
      console.log(`${chalk.bold('Total Users:')} ${communityStats.totalUsers.toLocaleString()}`);
      console.log(`${chalk.bold('Active Discussions:')} ${communityStats.activeDiscussions.toLocaleString()}`);
      console.log(`${chalk.bold('Theme Shares:')} ${communityStats.totalShares.toLocaleString()}`);
      console.log(`${chalk.bold('Collaborations:')} ${communityStats.activeCollaborations.toLocaleString()}`);
    } catch (error) {
      spinner.stop();
      console.error(chalk.red('Failed to load statistics:'), error instanceof Error ? error.message : error);
    }
  });

// Community subcommands
const communityCmd = program
  .command('community')
  .description('Community management commands');

communityCmd
  .command('profile [userId]')
  .description('View user profile')
  .action(async (userId?: string) => {
    await loadConfig();
    const community = getCommunity();
    const spinner = ora('Loading profile...').start();

    try {
      const targetUserId = userId || config.userId;
      if (!targetUserId) {
        spinner.stop();
        console.error(chalk.red('User ID required. Please login or specify a user ID.'));
        return;
      }

      const profile = await community.getUserProfile(targetUserId);
      const badges = await community.getUserBadges(targetUserId);

      spinner.stop();

      console.log(chalk.blue(`\n👤 ${profile.displayName || profile.username}\n`));
      console.log(`${chalk.bold('Username:')} ${profile.username}`);
      console.log(`${chalk.bold('Joined:')} ${new Date(profile.joinedAt).toLocaleDateString()}`);
      console.log(`${chalk.bold('Themes Created:')} ${profile.stats.themesCreated}`);
      console.log(`${chalk.bold('Downloads:')} ${profile.stats.totalDownloads.toLocaleString()}`);
      console.log(`${chalk.bold('Followers:')} ${profile.stats.followers}`);
      console.log(`${chalk.bold('Following:')} ${profile.stats.following}`);

      if (badges.length > 0) {
        console.log(chalk.blue('\n🏆 Badges:\n'));
        badges.forEach(badge => {
          console.log(`  ${badge.icon} ${badge.name} - ${badge.description}`);
        });
      }
    } catch (error) {
      spinner.stop();
      console.error(chalk.red('Failed to load profile:'), error instanceof Error ? error.message : error);
    }
  });

communityCmd
  .command('events')
  .description('View community events')
  .action(async () => {
    await loadConfig();
    const community = getCommunity();
    const spinner = ora('Loading events...').start();

    try {
      const events = await community.getCommunityEvents();
      
      spinner.stop();

      if (events.length === 0) {
        console.log(chalk.yellow('No upcoming community events.'));
        return;
      }

      console.log(chalk.blue('\n🎉 Community Events\n'));

      events.forEach(event => {
        console.log(chalk.bold(event.title));
        console.log(`  ${chalk.gray('Date:')} ${new Date(event.startDate).toLocaleDateString()}`);
        console.log(`  ${chalk.gray('Type:')} ${event.type}`);
        console.log(`  ${chalk.gray('Description:')} ${event.description}`);
        console.log();
      });
    } catch (error) {
      spinner.stop();
      console.error(chalk.red('Failed to load events:'), error instanceof Error ? error.message : error);
    }
  });

// Version and setup
program
  .name('omnipanel-theme')
  .description('OmniPanel Theme Marketplace CLI')
  .version('1.0.0');

// Error handling
program.exitOverride();

try {
  program.parse();
} catch (error) {
  if (error instanceof Error && error.name === 'CommanderError') {
    console.error(chalk.red(error.message));
    process.exit(1);
  }
  throw error;
}

export default program; 