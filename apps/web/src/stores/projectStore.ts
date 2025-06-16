// apps/web/src/stores/projectStore.ts
// Zustand store for project state management with reactive updates and persistence

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { projectService, type Project, type CreateProjectOptions, type OpenProjectOptions, type ProjectTemplate } from '@/services/projectService';

interface ProjectState {
  // Current state
  currentProject: Project | null;
  recentProjects: Project[];
  allProjects: Project[];
  templates: ProjectTemplate[];
  
  // UI state
  isLoading: boolean;
  isCreatingProject: boolean;
  isOpeningProject: boolean;
  error: string | null;
  
  // Project operations
  createProject: (options: CreateProjectOptions) => Promise<Project>;
  openProject: (options: OpenProjectOptions) => Promise<Project>;
  setCurrentProject: (project: Project) => Promise<void>;
  deleteProject: (projectId: string, deleteFiles?: boolean) => Promise<void>;
  
  // Project management
  refreshProjects: () => Promise<void>;
  searchProjects: (query: string) => Project[];
  getProjectById: (id: string) => Project | null;
  updateProjectSettings: (projectId: string, settings: any) => Promise<void>;
  
  // Template management
  getTemplates: () => ProjectTemplate[];
  addTemplate: (template: ProjectTemplate) => void;
  
  // Import/Export
  exportProject: (projectId: string) => Promise<string>;
  importProject: (configJson: string, targetPath: string) => Promise<Project>;
  
  // Utility actions
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  currentProject: null,
  recentProjects: [],
  allProjects: [],
  templates: [],
  isLoading: false,
  isCreatingProject: false,
  isOpeningProject: false,
  error: null
};

export const useProjectStore = create<ProjectState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Project operations
        createProject: async (options: CreateProjectOptions) => {
          set({ isCreatingProject: true, error: null });
          
          try {
            const project = await projectService.createProject(options);
            
            // Update state
            const state = get();
            const updatedProjects = [...state.allProjects, project];
            const updatedRecent = [project, ...state.recentProjects.filter(p => p.id !== project.id)].slice(0, 10);
            
            set({
              currentProject: project,
              allProjects: updatedProjects,
              recentProjects: updatedRecent,
              isCreatingProject: false,
              error: null
            });
            
            return project;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create project';
            set({ 
              isCreatingProject: false, 
              error: errorMessage 
            });
            throw error;
          }
        },

        openProject: async (options: OpenProjectOptions) => {
          set({ isOpeningProject: true, error: null });
          
          try {
            const project = await projectService.openProject(options);
            
            // Update state
            const state = get();
            let updatedProjects = state.allProjects;
            
            // Add to all projects if not already there
            if (!updatedProjects.find(p => p.id === project.id)) {
              updatedProjects = [...updatedProjects, project];
            } else {
              // Update existing project
              updatedProjects = updatedProjects.map(p => 
                p.id === project.id ? project : p
              );
            }
            
            const updatedRecent = [project, ...state.recentProjects.filter(p => p.id !== project.id)].slice(0, 10);
            
            set({
              currentProject: project,
              allProjects: updatedProjects,
              recentProjects: updatedRecent,
              isOpeningProject: false,
              error: null
            });
            
            return project;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to open project';
            set({ 
              isOpeningProject: false, 
              error: errorMessage 
            });
            throw error;
          }
        },

        setCurrentProject: async (project: Project) => {
          try {
            await projectService.setCurrentProject(project);
            
            const state = get();
            const updatedRecent = [project, ...state.recentProjects.filter(p => p.id !== project.id)].slice(0, 10);
            
            set({
              currentProject: project,
              recentProjects: updatedRecent,
              error: null
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to set current project';
            set({ error: errorMessage });
            throw error;
          }
        },

        deleteProject: async (projectId: string, deleteFiles = false) => {
          set({ isLoading: true, error: null });
          
          try {
            await projectService.deleteProject(projectId, deleteFiles);
            
            const state = get();
            const updatedProjects = state.allProjects.filter(p => p.id !== projectId);
            const updatedRecent = state.recentProjects.filter(p => p.id !== projectId);
            const currentProject = state.currentProject?.id === projectId ? null : state.currentProject;
            
            set({
              allProjects: updatedProjects,
              recentProjects: updatedRecent,
              currentProject,
              isLoading: false,
              error: null
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete project';
            set({ 
              isLoading: false, 
              error: errorMessage 
            });
            throw error;
          }
        },

        // Project management
        refreshProjects: async () => {
          set({ isLoading: true, error: null });
          
          try {
            const currentProject = projectService.getCurrentProject();
            const recentProjects = projectService.getRecentProjects();
            const allProjects = projectService.searchProjects({ limit: 100 });
            const templates = projectService.getTemplates();
            
            set({
              currentProject,
              recentProjects,
              allProjects,
              templates,
              isLoading: false,
              error: null
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to refresh projects';
            set({ 
              isLoading: false, 
              error: errorMessage 
            });
          }
        },

        searchProjects: (query: string) => {
          const state = get();
          if (!query.trim()) {
            return state.allProjects;
          }
          
          const lowerQuery = query.toLowerCase();
          return state.allProjects.filter(project =>
            project.name.toLowerCase().includes(lowerQuery) ||
            project.description.toLowerCase().includes(lowerQuery) ||
            project.path.toLowerCase().includes(lowerQuery) ||
            project.metadata.languages.some((lang: string) =>
              lowerQuery.includes(lang.toLowerCase())
            )
          );
        },

        getProjectById: (id: string) => {
          const state = get();
          return state.allProjects.find(p => p.id === id) || null;
        },

        updateProjectSettings: async (projectId: string, settings: any) => {
          set({ isLoading: true, error: null });
          
          try {
            await projectService.updateProjectSettings(projectId, settings);
            
            // Update project in state
            const state = get();
            const updatedProjects = state.allProjects.map(project => {
              if (project.id === projectId) {
                return {
                  ...project,
                  settings: { ...project.settings, ...settings },
                  updatedAt: new Date()
                };
              }
              return project;
            });
            
            const updatedCurrent = state.currentProject?.id === projectId
              ? updatedProjects.find(p => p.id === projectId) || state.currentProject
              : state.currentProject;
            
            set({
              allProjects: updatedProjects,
              currentProject: updatedCurrent,
              isLoading: false,
              error: null
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update project settings';
            set({ 
              isLoading: false, 
              error: errorMessage 
            });
            throw error;
          }
        },

        // Template management
        getTemplates: () => {
          return projectService.getTemplates();
        },

        addTemplate: (template: ProjectTemplate) => {
          projectService.addTemplate(template);
          const templates = projectService.getTemplates();
          set({ templates });
        },

        // Import/Export
        exportProject: async (projectId: string) => {
          set({ isLoading: true, error: null });
          
          try {
            const exportData = await projectService.exportProject(projectId);
            set({ isLoading: false, error: null });
            return exportData;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to export project';
            set({ 
              isLoading: false, 
              error: errorMessage 
            });
            throw error;
          }
        },

        importProject: async (configJson: string, targetPath: string) => {
          set({ isLoading: true, error: null });
          
          try {
            const project = await projectService.importProject(configJson, targetPath);
            
            const state = get();
            const updatedProjects = [...state.allProjects, project];
            const updatedRecent = [project, ...state.recentProjects].slice(0, 10);
            
            set({
              allProjects: updatedProjects,
              recentProjects: updatedRecent,
              currentProject: project,
              isLoading: false,
              error: null
            });
            
            return project;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to import project';
            set({ 
              isLoading: false, 
              error: errorMessage 
            });
            throw error;
          }
        },

        // Utility actions
        clearError: () => {
          set({ error: null });
        },

        reset: () => {
          set(initialState);
        }
      }),
      {
        name: 'omnipanel-project-store',
        partialize: (state) => ({
          currentProject: state.currentProject,
          recentProjects: state.recentProjects,
          allProjects: state.allProjects
        })
      }
    ),
    {
      name: 'project-store'
    }
  )
);

// Selectors for optimized re-renders
export const useCurrentProject = () => useProjectStore(state => state.currentProject);
export const useRecentProjects = () => useProjectStore(state => state.recentProjects);
export const useProjectLoading = () => useProjectStore(state => ({
  isLoading: state.isLoading,
  isCreatingProject: state.isCreatingProject,
  isOpeningProject: state.isOpeningProject
}));
export const useProjectError = () => useProjectStore(state => state.error);
export const useProjectTemplates = () => useProjectStore(state => state.templates);

// Initialize store on first load
if (typeof window !== 'undefined') {
  // Load initial data
  useProjectStore.getState().refreshProjects();
} 