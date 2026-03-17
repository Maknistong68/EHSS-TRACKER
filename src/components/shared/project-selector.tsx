'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useSupabase } from '@/lib/hooks/use-supabase';
import { ChevronDown, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Project {
  id: string;
  name: string;
  contract_no: string;
  location: string;
  region: string;
  start_year: number;
  status: string;
}

interface ProjectContextType {
  currentProject: Project | null;
  setCurrentProject: (project: Project) => void;
}

const ProjectContext = createContext<ProjectContextType>({
  currentProject: null,
  setCurrentProject: () => { },
});

export function useProject() {
  return useContext(ProjectContext);
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const supabase = useSupabase();
  const [, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  useEffect(() => {
    async function loadProjects() {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (data && data.length > 0) {
        setProjects(data);

        // Restore from local storage or use first project
        const savedId = localStorage.getItem('ehss_current_project');
        const saved = data.find((p) => p.id === savedId);
        setCurrentProject(saved || data[0]);
      }
    }
    loadProjects();
  }, [supabase]);

  const handleSetProject = useCallback((project: Project) => {
    setCurrentProject(project);
    localStorage.setItem('ehss_current_project', project.id);
  }, []);

  return (
    <ProjectContext.Provider value={{ currentProject, setCurrentProject: handleSetProject }}>
      {children}
    </ProjectContext.Provider>
  );
}

export default function ProjectSelector() {
  const { currentProject, setCurrentProject } = useProject();
  const supabase = useSupabase();
  const [projects, setProjects] = useState<Project[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function loadProjects() {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'active')
        .order('name');
      if (data) setProjects(data);
    }
    loadProjects();
  }, [supabase]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-100 text-sm"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Select project"
      >
        <Building2 className="h-4 w-4 text-gray-400" aria-hidden="true" />
        <span className="text-gray-700 font-medium truncate max-w-[200px]">
          {currentProject?.name || 'Select Project'}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-400" aria-hidden="true" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 z-50 mt-2 w-64 rounded-lg border border-gray-200 bg-white py-1 shadow-lg" role="listbox">
            {projects.length === 0 ? (
              <p className="px-4 py-3 text-sm text-gray-500">No active projects</p>
            ) : (
              projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => { setCurrentProject(project); setOpen(false); }}
                  className={cn(
                    'w-full text-left px-4 py-2 text-sm hover:bg-gray-50',
                    currentProject?.id === project.id ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                  )}
                  role="option"
                  aria-selected={currentProject?.id === project.id}
                >
                  <p className="font-medium truncate">{project.name}</p>
                  {project.contract_no && <p className="text-xs text-gray-400 truncate">{project.contract_no}</p>}
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
