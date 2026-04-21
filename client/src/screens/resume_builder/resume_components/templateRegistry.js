import Template1 from "./template1Screen";
import Template2 from "./template2Screen";

/**
 * Registry of available resume templates.
 * Add new templates here to automatically include them in the builder.
 */
const templateRegistry = {
  template1: {
    name: "Modern Minimal",
    component: Template1,
    thumbnail: "template1.png",
  },
  template2: {
    name: "Professional Timeline",
    component: Template2,
    thumbnail: "template2.png",
  },
  // Add more templates here
};

export const getTemplateComponent = (id) => {
  const template = templateRegistry[id] || templateRegistry.template1;
  return template.component;
};

export const getAllTemplates = () => {
  return Object.keys(templateRegistry).map((id) => ({
    id,
    ...templateRegistry[id],
  }));
};

export default templateRegistry;
