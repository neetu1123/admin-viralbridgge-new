export type MessageTemplate = {
  id: string;
  label: string;
  text: string;
  roles: ('brand' | 'creator')[];
};

export const MESSAGE_TEMPLATES: MessageTemplate[] = [
  { id: 'intro', label: 'Introduction', text: 'Hi! I reviewed your campaign and would love to collaborate.', roles: ['creator', 'brand'] },
  { id: 'brief_ack', label: 'Brief received', text: 'Thanks for sharing the brief. I will start working on the deliverables.', roles: ['creator'] },
  { id: 'deadline_confirm', label: 'Confirm deadline', text: 'Can you confirm the final submission deadline for this campaign?', roles: ['creator', 'brand'] },
  { id: 'revision_done', label: 'Revision submitted', text: 'I have uploaded the revised content for your review.', roles: ['creator'] },
  { id: 'approve_request', label: 'Request review', text: 'Please review my latest submission when you get a chance.', roles: ['creator'] },
  { id: 'revision_request', label: 'Request revision', text: 'Thanks for the submission. Please revise based on the feedback below.', roles: ['brand'] },
  { id: 'approved', label: 'Content approved', text: 'Great work! Your content has been approved.', roles: ['brand'] },
  { id: 'payment_info', label: 'Payment update', text: 'Escrow has been funded. You may begin working on deliverables.', roles: ['brand'] },
  { id: 'shipping', label: 'Product shipping', text: 'We have shipped the product. Please share your delivery address if not already provided.', roles: ['brand'] },
];

export function templatesForRole(role: 'brand' | 'creator') {
  return MESSAGE_TEMPLATES.filter((t) => t.roles.includes(role));
}
