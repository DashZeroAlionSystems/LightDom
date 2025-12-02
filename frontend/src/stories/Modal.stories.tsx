import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

/**
 * # Modal Component
 * 
 * Accessible modal dialog with focus management, keyboard navigation,
 * and customizable animations.
 * 
 * ## Styleguide Rules
 * - Always include clear close action
 * - Use descriptive title and description
 * - Focus should be trapped within modal
 * - Escape key should close the modal
 * - Clicking overlay should close (optional)
 */
const meta: Meta<typeof Modal> = {
  title: 'DESIGN SYSTEM/Organisms/Modal',
  component: Modal,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', 'full'],
      description: 'Modal width',
    },
    animation: {
      control: 'select',
      options: ['fade', 'slide', 'scale'],
      description: 'Entry animation',
    },
    closeOnOverlayClick: {
      control: 'boolean',
      description: 'Close when clicking overlay',
    },
    closeOnEscape: {
      control: 'boolean',
      description: 'Close when pressing Escape',
    },
    showCloseButton: {
      control: 'boolean',
      description: 'Show close button in header',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// Basic
// ============================================================================

export const Default: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Modal Title"
          description="This is a description of what this modal is about."
        >
          <p className="text-on-surface">
            This is the modal content. You can put any content here including
            forms, lists, or other components.
          </p>
          <ModalFooter>
            <Button variant="outlined" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsOpen(false)}>
              Confirm
            </Button>
          </ModalFooter>
        </Modal>
      </>
    );
  },
};

// ============================================================================
// Sizes
// ============================================================================

export const Sizes: Story = {
  render: () => {
    const [openModal, setOpenModal] = useState<string | null>(null);
    const sizes = ['sm', 'md', 'lg', 'xl', '2xl'] as const;
    
    return (
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => (
          <React.Fragment key={size}>
            <Button onClick={() => setOpenModal(size)}>
              {size.toUpperCase()} Modal
            </Button>
            <Modal
              isOpen={openModal === size}
              onClose={() => setOpenModal(null)}
              title={`${size.toUpperCase()} Modal`}
              description={`This is a ${size} sized modal.`}
              size={size}
            >
              <p className="text-on-surface">
                This modal demonstrates the {size} size option.
              </p>
              <ModalFooter>
                <Button onClick={() => setOpenModal(null)}>Close</Button>
              </ModalFooter>
            </Modal>
          </React.Fragment>
        ))}
      </div>
    );
  },
};

// ============================================================================
// Animations
// ============================================================================

export const Animations: Story = {
  render: () => {
    const [openModal, setOpenModal] = useState<string | null>(null);
    const animations = ['fade', 'slide', 'scale'] as const;
    
    return (
      <div className="flex gap-2">
        {animations.map((animation) => (
          <React.Fragment key={animation}>
            <Button onClick={() => setOpenModal(animation)}>
              {animation.charAt(0).toUpperCase() + animation.slice(1)} Animation
            </Button>
            <Modal
              isOpen={openModal === animation}
              onClose={() => setOpenModal(null)}
              title={`${animation.charAt(0).toUpperCase() + animation.slice(1)} Animation`}
              animation={animation}
            >
              <p className="text-on-surface">
                This modal uses the {animation} animation.
              </p>
              <ModalFooter>
                <Button onClick={() => setOpenModal(null)}>Close</Button>
              </ModalFooter>
            </Modal>
          </React.Fragment>
        ))}
      </div>
    );
  },
};

// ============================================================================
// Alert Dialogs
// ============================================================================

export const ConfirmationDialog: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <>
        <Button variant="error" onClick={() => setIsOpen(true)}>
          Delete Item
        </Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Confirm Deletion"
          description="Are you sure you want to delete this item? This action cannot be undone."
          size="sm"
        >
          <div className="flex items-center gap-3 p-4 bg-error/10 rounded-lg mb-4">
            <AlertTriangle className="w-6 h-6 text-error" />
            <p className="text-on-surface text-sm">
              This will permanently delete the item and all associated data.
            </p>
          </div>
          <ModalFooter>
            <Button variant="outlined" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="filled" 
              className="bg-error"
              onClick={() => setIsOpen(false)}
            >
              Delete
            </Button>
          </ModalFooter>
        </Modal>
      </>
    );
  },
};

export const SuccessDialog: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Show Success</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          size="sm"
          showCloseButton={false}
        >
          <div className="text-center py-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/20 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h3 className="text-lg font-semibold text-on-surface mb-2">
              Success!
            </h3>
            <p className="text-on-surface-variant mb-6">
              Your changes have been saved successfully.
            </p>
            <Button fullWidth onClick={() => setIsOpen(false)}>
              Continue
            </Button>
          </div>
        </Modal>
      </>
    );
  },
};

export const ErrorDialog: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <>
        <Button variant="error" onClick={() => setIsOpen(true)}>
          Show Error
        </Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          size="sm"
        >
          <div className="text-center py-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-error/20 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-error" />
            </div>
            <h3 className="text-lg font-semibold text-on-surface mb-2">
              Error Occurred
            </h3>
            <p className="text-on-surface-variant mb-6">
              Something went wrong. Please try again later.
            </p>
            <div className="flex gap-2">
              <Button variant="outlined" fullWidth onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button fullWidth onClick={() => setIsOpen(false)}>
                Try Again
              </Button>
            </div>
          </div>
        </Modal>
      </>
    );
  },
};

export const InfoDialog: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <>
        <Button variant="outlined" onClick={() => setIsOpen(true)}>
          Learn More
        </Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="About This Feature"
          size="md"
        >
          <div className="flex items-start gap-3 p-4 bg-primary/10 rounded-lg mb-4">
            <Info className="w-5 h-5 text-primary mt-0.5" />
            <div className="text-sm text-on-surface">
              <p className="font-medium mb-1">Did you know?</p>
              <p>This feature allows you to customize your experience with advanced options.</p>
            </div>
          </div>
          <ul className="list-disc pl-5 space-y-2 text-on-surface-variant">
            <li>Configure settings to match your workflow</li>
            <li>Save presets for quick access</li>
            <li>Share configurations with your team</li>
          </ul>
          <ModalFooter>
            <Button onClick={() => setIsOpen(false)}>Got it</Button>
          </ModalFooter>
        </Modal>
      </>
    );
  },
};

// ============================================================================
// Form Modal
// ============================================================================

export const FormModal: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Create New</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Create New Project"
          description="Fill in the details to create a new project."
          size="lg"
        >
          <div className="space-y-4">
            <Input label="Project Name" placeholder="Enter project name" />
            <Input label="Description" placeholder="Enter description" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Start Date" type="date" />
              <Input label="End Date" type="date" />
            </div>
          </div>
          <ModalFooter>
            <Button variant="outlined" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsOpen(false)}>
              Create Project
            </Button>
          </ModalFooter>
        </Modal>
      </>
    );
  },
};

// ============================================================================
// All Variants Showcase
// ============================================================================

export const AllVariants: Story = {
  render: () => {
    const [activeModal, setActiveModal] = useState<string | null>(null);
    
    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Modal Types</h3>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setActiveModal('default')}>Default</Button>
            <Button onClick={() => setActiveModal('form')}>Form</Button>
            <Button onClick={() => setActiveModal('confirm')}>Confirmation</Button>
            <Button onClick={() => setActiveModal('success')}>Success</Button>
          </div>
        </div>

        {/* Default Modal */}
        <Modal
          isOpen={activeModal === 'default'}
          onClose={() => setActiveModal(null)}
          title="Default Modal"
          description="This is a standard modal with title and description."
        >
          <p className="text-on-surface">Modal content goes here.</p>
          <ModalFooter>
            <Button onClick={() => setActiveModal(null)}>Close</Button>
          </ModalFooter>
        </Modal>

        {/* Form Modal */}
        <Modal
          isOpen={activeModal === 'form'}
          onClose={() => setActiveModal(null)}
          title="Form Modal"
          size="lg"
        >
          <div className="space-y-4">
            <Input label="Name" />
            <Input label="Email" type="email" />
          </div>
          <ModalFooter>
            <Button variant="outlined" onClick={() => setActiveModal(null)}>Cancel</Button>
            <Button onClick={() => setActiveModal(null)}>Submit</Button>
          </ModalFooter>
        </Modal>

        {/* Confirmation Modal */}
        <Modal
          isOpen={activeModal === 'confirm'}
          onClose={() => setActiveModal(null)}
          title="Confirm Action"
          size="sm"
        >
          <p className="text-on-surface mb-4">Are you sure you want to proceed?</p>
          <ModalFooter>
            <Button variant="outlined" onClick={() => setActiveModal(null)}>No</Button>
            <Button onClick={() => setActiveModal(null)}>Yes</Button>
          </ModalFooter>
        </Modal>

        {/* Success Modal */}
        <Modal
          isOpen={activeModal === 'success'}
          onClose={() => setActiveModal(null)}
          size="sm"
          showCloseButton={false}
        >
          <div className="text-center py-4">
            <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Success!</h3>
            <p className="text-on-surface-variant mb-4">Operation completed.</p>
            <Button onClick={() => setActiveModal(null)}>Done</Button>
          </div>
        </Modal>
      </div>
    );
  },
};
