'use client';

// Helper function to safely get error message
function getSafeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (error && typeof error === 'object') {
    const errObj = error as Record<string, unknown>;
    if (typeof errObj.message === 'string' && errObj.message) {
      return errObj.message;
    }
    if (typeof errObj.error_description === 'string' && errObj.error_description) {
      return errObj.error_description;
    }
    if (typeof errObj.details === 'string' && errObj.details) {
      return errObj.details;
    }
  }
  if (error !== null && error !== undefined) {
    // Only use String() for primitive values
    const type = typeof error;
    if (type === 'string') return error as string;
    if (type === 'number') return String(error);
    if (type === 'boolean') return String(error);
  }
  return 'An error occurred. Please try again.';
}

import { CreateCustomFieldOptionModal } from '@/components/CreateCustomFieldOptionModal';
import { CreateOrEditLabelForm } from '@/components/CreateOrEditLabelForm';
import { CustomFieldOptions } from '@/components/CustomFieldOptions';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  defaultLabels,
  defaultPriorities,
  defaultSizes,
  defaultStatuses,
} from '@/consts/default-options';
import { useModalDialog } from '@/hooks/useModalDialog';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { v4 as uid } from 'uuid';
import { secondaryBtnStyles, successBtnStyles } from '../commonStyles';
import { LabelList } from '../projects/[projectId]/settings/labels/LabelList';
import { useRouter } from 'next/navigation';
import { projects } from '@/utils/projects';
import { createClient } from '@/utils/supabase/client';

interface Props {
  projectDetails: {
    name: string;
    description: string;
    readme: string;
  };
}

export const CreateProjectModal = ({ projectDetails }: Props) => {
  const { isModalOpen, openModal, closeModal } = useModalDialog();
  const router = useRouter();
  const [statuses, setStatuses] = useState(defaultStatuses);
  const [sizes, setSizes] = useState(defaultSizes);
  const [priorities, setPriorities] = useState(defaultPriorities);
  const [labels, setLabels] = useState(defaultLabels);
  const [showNewLabelCard, setShowNewLabelCard] = useState(false);
  const [skipDefaultOptions, setSkipDefaultOption] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const AddNewOptionBtn = (
    <Button className={cn(secondaryBtnStyles, 'h-7 px-2 rounded-sm mr-2')}>
      <Plus className="w-4 h-4 mr-1" />
      New
    </Button>
  );

  const handleAddNewOptionItem = (
    data: Omit<ICustomFieldData, 'id'>,
    state: CustomFieldDBTableName
  ) => {
    switch (state) {
      case 'sizes':
        setSizes([...sizes, { id: uid(), ...data }]);
        break;
      case 'priorities':
        setPriorities([...priorities, { id: uid(), ...data }]);
        break;
      case 'statuses':
        setStatuses([...statuses, { id: uid(), ...data }]);
        break;
      default:
        break;
    }
  };

  const handleAddNewLabelItem = (data: ICustomFieldData) => {
    setLabels([...labels, data]);
    setShowNewLabelCard(false);
  };

  const handleRemoveLabelItem = (id: string) => {
    setLabels(labels.filter((item) => item.id !== id));
  };

  const handleCreateProject = async () => {
    // Prevent multiple simultaneous submissions
    if (isCreating) return;
    
    setIsCreating(true);
    
    try {
      const supabase = createClient();

      // Get session
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      
      if (!session) {
        // Use alert instead of toast to avoid potential issues
        alert('Please log in to create a project.');
        return;
      }

      const projectData = {
        name: projectDetails.name,
        description: projectDetails.description,
        readme: projectDetails.readme,
        ...(skipDefaultOptions
          ? {}
          : {
              statuses,
              sizes,
              priorities,
              labels,
            }),
      };

      const project = await projects.management.create(
        projectData as ProjectWithOptions,
        session.user.id
      );
      
      try {
        // Skip success toast to avoid potential serialization issues
        closeModal();
        if (project?.id) {
          // Use window.location instead of router.push to avoid any serialization issues
          window.location.href = `/projects/${project.id}`;
        }
      } catch (navError) {
        // Silently fail on navigation errors
        console.error('Navigation error');
      }
    } catch (error: unknown) {
      // Use setTimeout to delay error handling and avoid any sync issues
      setTimeout(() => {
        try {
          // Use safe error message extraction
          const errorMessage = getSafeErrorMessage(error);
          
          // Check for database-related errors (case-insensitive)
          const errorLower = errorMessage.toLowerCase();
          const isDatabaseError = 
            errorLower.includes('does not exist') || 
            errorLower.includes('relation') || 
            errorLower.includes('pgRST') ||
            errorLower.includes('database') ||
            errorLower.includes('violates foreign key') ||
            errorLower.includes('null value') || 
            errorLower.includes('column') || 
            errorLower.includes('table') ||
            errorLower.includes('schema') ||
            errorLower.includes('not created');
          
          // Use alert instead of toast to avoid potential serialization issues
          if (isDatabaseError) {
            alert('Database Not Ready: Please run the SQL schema in Supabase. Some tables may be missing.');
          } else {
            alert('Error: ' + errorMessage);
          }
        } catch {
          // Silently fail if error handling itself fails
        }
      }, 100);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogTrigger
        onClick={openModal}
        className={cn(
          successBtnStyles,
          'w-28 flex items-center justify-center',
          'disabled:cursor-not-allowed disabled:opacity-40'
        )}
        disabled={!projectDetails.name}
      >
        Continue
      </DialogTrigger>
      <DialogContent className="md:min-w-[90%] lg:min-w-[70%] max-h-screen overflow-auto">
        <DialogHeader>
          <DialogTitle>{projectDetails.name}</DialogTitle>
        </DialogHeader>

        <DialogDescription>
          Customize default options for your project.
        </DialogDescription>
        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto p-2">
          <CustomFieldOptions
            title="Sizes"
            field="size"
            options={sizes}
            setOptions={setSizes}
            hiddenDescription
            embeddedCreateOptionEle={
              <CreateCustomFieldOptionModal
                title="Create new size option"
                handleSubmit={(data) => handleAddNewOptionItem(data, 'sizes')}
                triggerBtn={AddNewOptionBtn}
                action="create-new-project"
              />
            }
          />
          <CustomFieldOptions
            title="Priorities"
            field="priority"
            options={priorities}
            setOptions={setPriorities}
            hiddenDescription
            embeddedCreateOptionEle={
              <CreateCustomFieldOptionModal
                title="Create new priority option"
                handleSubmit={(data) =>
                  handleAddNewOptionItem(data, 'priorities')
                }
                triggerBtn={AddNewOptionBtn}
                action="create-new-project"
              />
            }
          />
          <CustomFieldOptions
            title="Columns"
            field="status"
            options={statuses}
            setOptions={setStatuses}
            hiddenDescription
            embeddedCreateOptionEle={
              <CreateCustomFieldOptionModal
                title="Create new status option"
                handleSubmit={(data) =>
                  handleAddNewOptionItem(data, 'statuses')
                }
                triggerBtn={AddNewOptionBtn}
                action="create-new-project"
              />
            }
          />
          <div>
            <div className="flex justify-between items-center">
              <h1 className="text-lg py-3">Labels</h1>
              <Button
                onClick={() => setShowNewLabelCard(true)}
                className={cn(secondaryBtnStyles, 'h-7 px-2 rounded-sm mr-2')}
              >
                <Plus className="w-4 h-4 mr-1" />
                New
              </Button>
            </div>

            {showNewLabelCard && (
              <CreateOrEditLabelForm
                save={(data) => handleAddNewLabelItem(data)}
                cancel={() => setShowNewLabelCard(false)}
              />
            )}

            <div className="rounded border">
              <LabelList
                labels={labels}
                hiddenDescription
                onLabelDeleted={handleRemoveLabelItem}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Checkbox
            checked={skipDefaultOptions}
            onClick={() => setSkipDefaultOption(!skipDefaultOptions)}
          />
          <Label>Skip Default options. I will create my own options</Label>
        </div>

        <DialogFooter>
          <div className="flex justify-end">
            <Button
              onClick={handleCreateProject}
              className={cn(successBtnStyles, 'w-28')}
              disabled={isCreating}
            >
              {isCreating ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
