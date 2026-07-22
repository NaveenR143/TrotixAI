import Template1 from "./template1Screen";
import Template2 from "./template2Screen";
import Template3 from "./template3Screen";
import Template4 from "./template4Screen";
import Template5 from "./template5Screen";
import Template6 from "./template6Screen";
import Template7 from "./template7Screen";
import Template8 from "./template8Screen";
import Template9 from "./template9Screen";

import Template11 from "./template11Screen";
import Template12 from "./template12Screen";
import Template13 from "./template13Screen";
import Template14 from "./template14Screen";
import Template15 from "./template15Screen";

/**
 * Registry of available resume templates.
 * Add new templates here to automatically include them in the builder.
 */
const templateRegistry = {
  template1: {
    name: "Modern Minimal",
    component: Template1,
    thumbnail: "template_1.png",
  },
  template2: {
    name: "Professional Timeline",
    component: Template2,
    thumbnail: "template_2.png",
  },
  template3p: {
    name: "Classic Professional",
    component: Template3,
    thumbnail: "template_3.png",
  },
  template4p: {
    name: "Modern Executive",
    component: Template4,
    thumbnail: "template_4_p.png",
  },
  template5p: {
    name: "Corporate Minimalist",
    component: Template5,
    thumbnail: "template_5_p.png",
  },
  template6p: {
    name: "Elegant Professional",
    component: Template6,
    thumbnail: "template_6_p.png",
  },
  template7p: {
    name: "Modern ATS Corporate",
    component: Template7,
    thumbnail: "template_7_p.png",
  },
  template8p: {
    name: "Blue Teal Gradient",
    component: Template8,
    thumbnail: "template_8_p.png",
  },
  template9p: {
    name: "Forest Green Professional",
    component: Template9,
    thumbnail: "template_9_p.png",
  },
  template11p: {
    name: "ATS Optimized Professional",
    component: Template11,
    thumbnail: "template_11_p.png",
  },
  template12: {
    name: "Professional Elegance",
    component: Template12,
    thumbnail: "template_12.png",
  },
  template13: {
    name: "Modern Professional",
    component: Template13,
    thumbnail: "template_13.png",
  },
  template14: {
    name: "Indigo Executive",
    component: Template14,
    thumbnail: "template_14.png",
  },
  template15p: {
    name: "ATS Professional Photo",
    component: Template15,
    thumbnail: "template_15_p.png",
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
