import { SafeStorage } from './localStorage';
import { TextBoxDrawing } from './drawingTools';

export interface TextBoxTemplate {
  id: string;
  name: string;
  style: Partial<TextBoxDrawing>;
  createdAt: number;
}

const TEMPLATES_STORAGE_KEY = 'textBoxTemplates';

export class TextBoxTemplateManager {
  static getTemplates(): TextBoxTemplate[] {
    return SafeStorage.getJSON<TextBoxTemplate[]>(TEMPLATES_STORAGE_KEY) || [];
  }

  static saveTemplate(name: string, style: Partial<TextBoxDrawing>): TextBoxTemplate {
    const templates = this.getTemplates();
    const template: TextBoxTemplate = {
      id: `tpl-${Date.now()}-${Math.random()}`,
      name,
      style,
      createdAt: Date.now(),
    };

    templates.push(template);
    SafeStorage.setJSON(TEMPLATES_STORAGE_KEY, templates);
    return template;
  }

  static deleteTemplate(id: string): void {
    const templates = this.getTemplates();
    const filtered = templates.filter(t => t.id !== id);
    SafeStorage.setJSON(TEMPLATES_STORAGE_KEY, filtered);
  }

  static getTemplate(id: string): TextBoxTemplate | null {
    const templates = this.getTemplates();
    return templates.find(t => t.id === id) || null;
  }

  static updateTemplate(id: string, updates: Partial<TextBoxTemplate>): void {
    const templates = this.getTemplates();
    const index = templates.findIndex(t => t.id === id);
    if (index !== -1) {
      templates[index] = { ...templates[index], ...updates };
      SafeStorage.setJSON(TEMPLATES_STORAGE_KEY, templates);
    }
  }

  // Default templates
  static getDefaultTemplates(): Partial<TextBoxDrawing>[] {
    return [
      {
        // Headline style
        fontSize: 24,
        fontWeight: '700',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        color: '#FFFFFF',
        backgroundColor: '#8B4545',
        backgroundOpacity: 1,
        backgroundEnabled: true,
        borderEnabled: false,
        textAlign: 'center',
        padding: 16,
      },
      {
        // Subtitle style
        fontSize: 16,
        fontWeight: '500',
        fontStyle: 'italic',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        color: '#000000',
        backgroundColor: '#F5F3F0',
        backgroundOpacity: 0.9,
        backgroundEnabled: true,
        borderEnabled: true,
        borderColor: '#8B4545',
        borderWidth: 1,
        textAlign: 'left',
        padding: 12,
      },
      {
        // Callout style
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        color: '#8B4545',
        backgroundColor: '#FFFFFF',
        backgroundOpacity: 0.95,
        backgroundEnabled: true,
        borderEnabled: true,
        borderColor: '#8B4545',
        borderWidth: 2,
        textAlign: 'center',
        padding: 14,
      },
      {
        // Minimal style
        fontSize: 16,
        fontWeight: '400',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        color: '#FFFFFF',
        backgroundColor: '#000000',
        backgroundOpacity: 0.7,
        backgroundEnabled: true,
        borderEnabled: false,
        textAlign: 'left',
        padding: 10,
      },
    ];
  }
}
