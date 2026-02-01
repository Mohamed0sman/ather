'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogFooter, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

// Simple alert-based modal that avoids all toast and console.error issues
export function SimpleCreateProjectModal({ projectDetails }: { projectDetails: { name: string; description: string; readme: string } }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [skipDefaultOptions, setSkipDefaultOptions] = useState(false);

  const handleCreateProject = async () => {
    if (isCreating) return;
    setIsCreating(true);

    try {
      const response = await fetch('/api/create-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: projectDetails.name,
          description: projectDetails.description,
          readme: projectDetails.readme,
          skipDefaultOptions,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('Project created successfully!');
        setIsOpen(false);
        window.location.href = `/projects/${data.projectId}`;
      } else {
        alert('Error: ' + (data.error || 'Failed to create project'));
      }
    } catch (err) {
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className={cn(successBtnStyles, 'gap-2')}>
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Project</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Add a new project to manage tasks and collaborate with your team.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Project name</Label>
            <div className="font-medium">{projectDetails.name || 'Untitled Project'}</div>
          </div>
          
          <div className="space-y-2">
            <Label>Description</Label>
            <div className="text-sm text-muted-foreground">
              {projectDetails.description || 'No description provided'}
            </div>
          </div>

          <Separator className="my-2" />

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="skipOptions" 
              checked={skipDefaultOptions}
              onCheckedChange={(checked) => setSkipDefaultOptions(checked as boolean)}
            />
            <Label htmlFor="skipOptions">Skip creating default statuses, labels, priorities, and sizes</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={handleCreateProject} disabled={isCreating || !projectDetails.name.trim()}>
            {isCreating ? 'Creating...' : 'Create Project'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const successBtnStyles = 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 border-transparent';
