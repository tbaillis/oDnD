// Battlefield Settings Manager - Handle grid colors and background images
import type { Graphics, Sprite } from 'pixi.js'

export interface BattlefieldTheme {
  name: string;
  lightSquare: number;  // Hex color for light squares
  darkSquare: number;   // Hex color for dark squares
  gridLines: number;    // Hex color for grid lines
  description: string;
}

export interface BattlefieldConfig {
  theme: string;
  backgroundImage: string | null;
  backgroundOpacity: number;
  gridOpacity: number;
}

// Predefined battlefield color themes
export const BATTLEFIELD_THEMES: Record<string, BattlefieldTheme> = {
  classic_gray: {
    name: "Classic Gray",
    lightSquare: 0x2b2f36,  // Current dark color
    darkSquare: 0x23272e,   // Current light color  
    gridLines: 0x3a3f47,    // Current grid lines
    description: "Traditional gray battlefield (current default)"
  },
  
  forest_green: {
    name: "Forest Green",
    lightSquare: 0x2d4a2b,  // Dark forest green
    darkSquare: 0x1e3a1c,   // Darker forest green
    gridLines: 0x4a6b47,    // Light forest green lines
    description: "Natural forest environment"
  },
  
  dungeon_brown: {
    name: "Dungeon Brown",
    lightSquare: 0x3e2723,  // Dark brown stone
    darkSquare: 0x2e1a17,   // Darker brown stone
    gridLines: 0x5d4037,    // Light brown lines
    description: "Underground dungeon stone"
  },
  
  arctic_white: {
    name: "Arctic White",
    lightSquare: 0xf5f5f5,  // Light gray/white
    darkSquare: 0xe0e0e0,   // Slightly darker white
    gridLines: 0xbdbdbd,    // Gray lines
    description: "Snow-covered arctic terrain"
  },
  
  ocean_blue: {
    name: "Ocean Blue",
    lightSquare: 0x1e3a8a,  // Dark blue
    darkSquare: 0x1e293b,   // Darker blue-gray
    gridLines: 0x3b82f6,    // Light blue lines
    description: "Oceanic or underwater environment"
  }
};

export class BattlefieldSettings {
  private config: BattlefieldConfig;
  private settingsPanel: HTMLElement | null = null;
  private onConfigChange: ((config: BattlefieldConfig) => void) | null = null;
  private presets: Record<string, string> | null = null;

  constructor(presets?: Record<string, string>, defaultPresetKey?: string) {
    // store presets (may include image URLs or data URIs)
    this.presets = presets || null;
    // Load saved settings or use defaults
    this.config = this.loadSettings();

    // If no background was saved and a default preset was provided, apply it
    if (!this.config.backgroundImage && this.presets && defaultPresetKey && this.presets[defaultPresetKey]) {
      this.setConfig({ backgroundImage: this.presets[defaultPresetKey] });
    }
  }

  private loadSettings(): BattlefieldConfig {
    try {
      const saved = localStorage.getItem('battlefieldConfig');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          theme: parsed.theme || 'classic_gray',
          backgroundImage: parsed.backgroundImage || null,
          backgroundOpacity: typeof parsed.backgroundOpacity === 'number' ? parsed.backgroundOpacity : 0.5,
          gridOpacity: typeof parsed.gridOpacity === 'number' ? parsed.gridOpacity : 0.7
        };
      }
    } catch (error) {
      console.warn('Failed to load battlefield settings:', error);
    }

    return {
      theme: 'classic_gray',
      backgroundImage: null,
      backgroundOpacity: 0.5,
      gridOpacity: 0.7
    };
  }

  private saveSettings(): void {
    try {
      localStorage.setItem('battlefieldConfig', JSON.stringify(this.config));
    } catch (error) {
      console.warn('Failed to save battlefield settings:', error);
    }
  }

  public getConfig(): BattlefieldConfig {
    return { ...this.config };
  }

  public setConfig(newConfig: Partial<BattlefieldConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.saveSettings();
    
    if (this.onConfigChange) {
      this.onConfigChange(this.config);
    }
    
    this.updateSettingsPanel();
  }

  public onSettingsChange(callback: (config: BattlefieldConfig) => void): void {
    this.onConfigChange = callback;
  }

  public showSettingsPanel(): void {
    if (this.settingsPanel) {
      this.settingsPanel.style.display = 'block';
      return;
    }

    this.createSettingsPanel();
  }

  public hideSettingsPanel(): void {
    if (this.settingsPanel) {
      this.settingsPanel.style.display = 'none';
    }
  }

  private createSettingsPanel(): void {
    this.settingsPanel = document.createElement('div');
    this.settingsPanel.id = 'battlefield-settings-panel';
    this.settingsPanel.innerHTML = this.getSettingsPanelHTML();
    
    // Apply styles
    Object.assign(this.settingsPanel.style, {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '500px',
      maxHeight: '80vh',
      overflowY: 'auto',
      background: 'rgba(20, 25, 30, 0.95)',
      border: '2px solid #8b5cf6',
      borderRadius: '12px',
      zIndex: '2500',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      fontFamily: "'Segoe UI', system-ui, Arial, sans-serif"
    });

    document.body.appendChild(this.settingsPanel);
    this.attachEventListeners();
  }

  private getSettingsPanelHTML(): string {
    const buildColorDataUri = (hex: string) => {
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><rect width='100%' height='100%' fill='${hex}'/></svg>`;
      return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    };

    // Preset entries for the page background (images, solids, gradients)
    const pagePresets: Array<{ key: string; label: string; thumb: string; value: string }> = [];
    // include image presets first
    if (this.presets) {
      for (const [k, v] of Object.entries(this.presets)) {
        pagePresets.push({ key: k, label: k, thumb: v, value: v });
      }
    }

    // Solid color presets
    const colorPresets: Array<{ key:string; label:string; hex:string }> = [
      { key: 'black', label: 'Black', hex: '#000000' },
      { key: 'purple', label: 'Purple', hex: '#6b21a8' },
      { key: 'green', label: 'Green', hex: '#065f46' },
      { key: 'blue', label: 'Blue', hex: '#1e3a8a' },
      { key: 'white', label: 'White', hex: '#ffffff' }
    ];
    for (const c of colorPresets) {
      pagePresets.push({ key: `color_${c.key}`, label: c.label, thumb: buildColorDataUri(c.hex), value: c.hex });
    }

    // Gradient presets (CSS linear-gradient strings)
    const gradientPresets: Array<{ key:string; label:string; css:string }> = [
      { key: 'grad_purple', label: 'Purple Gradient', css: 'linear-gradient(135deg, #6b21a8 0%, #8b5cf6 100%)' },
      { key: 'grad_blue', label: 'Blue Gradient', css: 'linear-gradient(135deg, #1e3a8a 0%, #06b6d4 100%)' },
      { key: 'grad_green', label: 'Green Gradient', css: 'linear-gradient(135deg, #065f46 0%, #10b981 100%)' }
    ];
    for (const g of gradientPresets) {
      // build a small gradient SVG thumbnail
      const thumb = `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><defs><linearGradient id='g' x1='0' x2='1' y1='0' y2='1'><stop offset='0' stop-color='${g.css.split(',')[0].match(/#\w+/)?.[0]||'#000'}'/><stop offset='1' stop-color='${g.css.split(',').pop()?.match(/#\w+/)?.[0]||'#fff'}'/></linearGradient></defs><rect width='100%' height='100%' fill='url(%23g)'/></svg>` )}`;
      pagePresets.push({ key: g.key, label: g.label, thumb, value: g.css });
    }

    return `
      <div style="padding: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <h2 style="color: white; margin: 0; font-size: 1.5rem; font-weight: 700;">
            ⚔️ Battlefield Settings
          </h2>
          <button id="close-battlefield-settings" style="background: #ef4444; color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; font-size: 18px; display: flex; align-items: center; justify-content: center;">×</button>
        </div>

        <!-- Theme Selection -->
        <div style="margin-bottom: 2rem;">
          <h3 style="color: white; margin: 0 0 1rem 0; font-size: 1.125rem; font-weight: 600;">Color Theme</h3>
          <div id="theme-options" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem;">
            ${Object.entries(BATTLEFIELD_THEMES).map(([key, theme]) => `
              <div class="theme-option ${this.config.theme === key ? 'selected' : ''}" 
                   data-theme="${key}"
                   style="
                     border: 2px solid ${this.config.theme === key ? '#8b5cf6' : '#444'}; 
                     border-radius: 8px; 
                     padding: 1rem; 
                     cursor: pointer; 
                     transition: all 0.2s ease;
                     background: rgba(30, 35, 40, 0.6);
                   ">
                <div style="margin-bottom: 0.5rem;">
                  <div style="font-weight: 600; color: white; font-size: 0.875rem; margin-bottom: 0.25rem;">${theme.name}</div>
                  <div style="font-size: 0.75rem; color: #bbb; line-height: 1.3;">${theme.description}</div>
                </div>
                <div style="display: flex; gap: 2px; height: 20px;">
                  <div style="flex: 1; background-color: #${theme.lightSquare.toString(16).padStart(6, '0')}; border-radius: 2px;"></div>
                  <div style="flex: 1; background-color: #${theme.darkSquare.toString(16).padStart(6, '0')}; border-radius: 2px;"></div>
                  <div style="width: 2px; background-color: #${theme.gridLines.toString(16).padStart(6, '0')}; border-radius: 1px;"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Background Image -->
        <div style="margin-bottom: 2rem;">
          <h3 style="color: white; margin: 0 0 1rem 0; font-size: 1.125rem; font-weight: 600;">Background Image</h3>
          
          <!-- Preset selector for page background -->
          <div style="margin-bottom: 1rem;">
            <label style="display:block; color:white; font-weight:500; margin-bottom:0.5rem;">Page Background Presets:</label>
            <div id="page-background-presets" style="display:flex; gap:8px; flex-wrap:wrap;">
              ${pagePresets.map(p => `
                <button class="page-bg-preset" data-value="${p.value}" title="${p.label}" style="width:64px; height:64px; padding:4px; border-radius:6px; border:2px solid ${this.config.backgroundImage === p.value ? '#8b5cf6' : '#333'}; background:#111; cursor:pointer;">
                  <img src="${p.thumb}" style="width:100%; height:100%; object-fit:cover; border-radius:4px; display:block;" alt="${p.label}"/>
                </button>
              `).join('')}
            </div>
          </div>
          
          <div style="margin-bottom: 1rem;">
            <label style="display: block; color: white; font-weight: 500; margin-bottom: 0.5rem;">Upload Background Image:</label>
            <input type="file" id="background-upload" accept="image/*" 
                   style="width: 100%; padding: 0.5rem; background: rgba(30, 35, 40, 0.8); color: white; border: 1px solid #444; border-radius: 6px;">
          </div>

          <div style="margin-bottom: 1rem;">
            <label style="display: block; color: white; font-weight: 500; margin-bottom: 0.5rem;">Or Enter Image URL:</label>
            <input type="url" id="background-url" placeholder="https://example.com/image.jpg" 
                   value="${this.config.backgroundImage || ''}"
                   style="width: 100%; padding: 0.5rem; background: rgba(30, 35, 40, 0.8); color: white; border: 1px solid #444; border-radius: 6px;">
          </div>

          ${this.config.backgroundImage ? `
            <div style="margin-bottom: 1rem; text-align: center;">
              <div style="color: #8b5cf6; font-size: 0.875rem; margin-bottom: 0.5rem;">Current Background:</div>
              <img src="${this.config.backgroundImage}" 
                   style="max-width: 100%; max-height: 100px; border-radius: 4px; border: 1px solid #444;"
                   onerror="this.style.display='none';">
            </div>
          ` : ''}

          <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
            <div style="flex: 1;">
              <label style="display: block; color: white; font-weight: 500; margin-bottom: 0.5rem;">Background Opacity:</label>
              <input type="range" id="background-opacity" min="0" max="1" step="0.1" 
                     value="${this.config.backgroundOpacity}"
                     style="width: 100%; accent-color: #8b5cf6;">
              <div style="color: #bbb; font-size: 0.75rem; text-align: center; margin-top: 0.25rem;">
                ${Math.round(this.config.backgroundOpacity * 100)}%
              </div>
            </div>
            
            <div style="flex: 1;">
              <label style="display: block; color: white; font-weight: 500; margin-bottom: 0.5rem;">Grid Opacity:</label>
              <input type="range" id="grid-opacity" min="0" max="1" step="0.1" 
                     value="${this.config.gridOpacity}"
                     style="width: 100%; accent-color: #8b5cf6;">
              <div style="color: #bbb; font-size: 0.75rem; text-align: center; margin-top: 0.25rem;">
                ${Math.round(this.config.gridOpacity * 100)}%
              </div>
            </div>
          </div>

          <button id="clear-background" 
                  style="width: 100%; padding: 0.5rem; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
            Clear Background Image
          </button>
        </div>

        <!-- Action buttons -->
        <div style="display: flex; gap: 1rem; justify-content: flex-end; border-top: 1px solid #444; padding-top: 1rem;">
          <button id="reset-battlefield-settings" 
                  style="padding: 0.75rem 1.5rem; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
            Reset to Default
          </button>
          <button id="apply-battlefield-settings" 
                  style="padding: 0.75rem 1.5rem; background: #8b5cf6; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
            Apply Changes
          </button>
        </div>
      </div>
    `;
  }

  private attachEventListeners(): void {
    if (!this.settingsPanel) return;

    // Close button
    const closeBtn = this.settingsPanel.querySelector('#close-battlefield-settings');
    closeBtn?.addEventListener('click', () => this.hideSettingsPanel());

    // Theme selection
    const themeOptions = this.settingsPanel.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
      option.addEventListener('click', () => {
        const theme = option.getAttribute('data-theme');
        if (theme) {
          // Update visual selection
          themeOptions.forEach(opt => {
            opt.classList.remove('selected');
            (opt as HTMLElement).style.borderColor = '#444';
          });
          option.classList.add('selected');
          (option as HTMLElement).style.borderColor = '#8b5cf6';
          
          // Update config
          this.setConfig({ theme });
        }
      });
    });

    // Background image file upload
    const uploadInput = this.settingsPanel.querySelector('#background-upload') as HTMLInputElement;
    uploadInput?.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          this.setConfig({ backgroundImage: imageUrl });
          // Clear URL input when file is uploaded
          const urlInput = this.settingsPanel?.querySelector('#background-url') as HTMLInputElement;
          if (urlInput) urlInput.value = imageUrl;
        };
        reader.readAsDataURL(file);
      }
    });

    // Background image URL
    const urlInput = this.settingsPanel.querySelector('#background-url') as HTMLInputElement;
    urlInput?.addEventListener('change', (e) => {
      const url = (e.target as HTMLInputElement).value;
      this.setConfig({ backgroundImage: url || null });
    });

    // Preset buttons
    const presetButtons = this.settingsPanel.querySelectorAll('.bg-preset');
    presetButtons.forEach(btn => {
      btn.addEventListener('click', (ev) => {
        const target = ev.currentTarget as HTMLElement;
        const bg = target.getAttribute('data-bg') || null;
        this.setConfig({ backgroundImage: bg });

        // Update URL input to show selected preset (for display)
        const urlInput2 = this.settingsPanel?.querySelector('#background-url') as HTMLInputElement;
        if (urlInput2) urlInput2.value = bg || '';
      });
    });

    // Page background preset buttons (images, colors, gradients)
    const pagePresetButtons = this.settingsPanel.querySelectorAll('.page-bg-preset');
    pagePresetButtons.forEach(btn => {
      btn.addEventListener('click', (ev) => {
        const target = ev.currentTarget as HTMLElement;
        const value = target.getAttribute('data-value') || null;
        if (!value) return;

        // If value looks like a CSS gradient (starts with 'linear-gradient') store as-is
        if (value.startsWith('linear-gradient')) {
          this.setConfig({ backgroundImage: value });
        } else if (value.startsWith('data:') || value.startsWith('http') || value.startsWith('blob:')) {
          // Image data URI or URL
          this.setConfig({ backgroundImage: value });
        } else if (value.startsWith('#')) {
          // Solid color hex - store as CSS color value
          this.setConfig({ backgroundImage: value });
        } else {
          // Fallback - store raw value
          this.setConfig({ backgroundImage: value });
        }
      });
    });

    // Opacity sliders
    const backgroundOpacitySlider = this.settingsPanel.querySelector('#background-opacity') as HTMLInputElement;
    backgroundOpacitySlider?.addEventListener('input', (e) => {
      const opacity = parseFloat((e.target as HTMLInputElement).value);
      this.setConfig({ backgroundOpacity: opacity });
    });

    const gridOpacitySlider = this.settingsPanel.querySelector('#grid-opacity') as HTMLInputElement;
    gridOpacitySlider?.addEventListener('input', (e) => {
      const opacity = parseFloat((e.target as HTMLInputElement).value);
      this.setConfig({ gridOpacity: opacity });
    });

    // Clear background
    const clearBtn = this.settingsPanel.querySelector('#clear-background');
    clearBtn?.addEventListener('click', () => {
      this.setConfig({ backgroundImage: null });
      const urlInput = this.settingsPanel?.querySelector('#background-url') as HTMLInputElement;
      if (urlInput) urlInput.value = '';
    });

    // Reset settings
    const resetBtn = this.settingsPanel.querySelector('#reset-battlefield-settings');
    resetBtn?.addEventListener('click', () => {
      this.setConfig({
        theme: 'classic_gray',
        backgroundImage: null,
        backgroundOpacity: 0.5,
        gridOpacity: 0.7
      });
      this.updateSettingsPanel();
    });

    // Apply settings (close panel)
    const applyBtn = this.settingsPanel.querySelector('#apply-battlefield-settings');
    applyBtn?.addEventListener('click', () => this.hideSettingsPanel());
  }

  private updateSettingsPanel(): void {
    if (!this.settingsPanel) return;
    
    // Recreate the panel content with updated values
    this.settingsPanel.innerHTML = this.getSettingsPanelHTML();
    this.attachEventListeners();
  }

  // Static method to update grid graphics with current theme
  public static updateBattlefieldGraphics(
    grid: Graphics, 
    lines: Graphics, 
    backgroundSprite: Sprite | null,
    config: BattlefieldConfig,
    WIDTH: number, 
    HEIGHT: number, 
    CELL: number
  ): void {
    const theme = BATTLEFIELD_THEMES[config.theme];
    if (!theme) return;

    // Clear existing graphics
    grid.clear();
    lines.clear();

    // Update grid squares
    grid.alpha = config.gridOpacity;
    for (let y = 0; y < HEIGHT; y += CELL) {
      for (let x = 0; x < WIDTH; x += CELL) {
        const dark = ((x / CELL + y / CELL) % 2) === 0;
        grid.rect(x, y, CELL, CELL).fill({ 
          color: dark ? theme.darkSquare : theme.lightSquare 
        });
      }
    }

    // Update grid lines
    lines.stroke({ color: theme.gridLines, width: 1 });
    for (let x = 0; x <= WIDTH; x += CELL) lines.moveTo(x, 0).lineTo(x, HEIGHT);
    for (let y = 0; y <= HEIGHT; y += CELL) lines.moveTo(0, y).lineTo(WIDTH, y);

    // Handle background image
    if (config.backgroundImage && backgroundSprite) {
      backgroundSprite.alpha = config.backgroundOpacity;
      backgroundSprite.visible = true;
      
      // Scale to cover the battlefield while maintaining aspect ratio
      const scaleX = WIDTH / backgroundSprite.texture.width;
      const scaleY = HEIGHT / backgroundSprite.texture.height;
      const scale = Math.max(scaleX, scaleY);
      
      backgroundSprite.scale.set(scale, scale);
      backgroundSprite.position.set(
        (WIDTH - backgroundSprite.width) / 2,
        (HEIGHT - backgroundSprite.height) / 2
      );
    } else if (backgroundSprite) {
      backgroundSprite.visible = false;
    }
  }
}
