import React, { useState } from 'react';
import { Palette, Check } from 'lucide-react';
import {
  commandPaletteThemes,
  CommandPaletteThemeName,
  applyCommandPaletteTheme,
  loadCommandPaletteTheme,
  saveCommandPaletteTheme,
} from '@/config/command-palette-theme';

export function CommandPaletteThemeSelector() {
  const [currentTheme, setCurrentTheme] = useState<CommandPaletteThemeName>(
    loadCommandPaletteTheme()
  );

  const handleThemeChange = (themeName: CommandPaletteThemeName) => {
    setCurrentTheme(themeName);
    saveCommandPaletteTheme(themeName);
  };

  const themeDisplayNames: Record<CommandPaletteThemeName, string> = {
    default: 'Default Dark',
    light: 'Light',
    discord: 'Discord',
    glass: 'Glass Morphism',
    material: 'Material Design',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-on-surface">
        <Palette className="w-4 h-4" />
        Command Palette Theme
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {(Object.keys(commandPaletteThemes) as CommandPaletteThemeName[]).map((themeName) => {
          const theme = commandPaletteThemes[themeName];
          const isSelected = currentTheme === themeName;

          return (
            <button
              key={themeName}
              onClick={() => handleThemeChange(themeName)}
              className="relative group rounded-xl p-4 text-left transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: theme.background,
                border: `2px solid ${isSelected ? theme.selectedBackground : theme.border}`,
                boxShadow: isSelected
                  ? `0 4px 12px ${theme.shadow}`
                  : `0 2px 6px ${theme.shadow}`,
              }}
            >
              {isSelected && (
                <div
                  className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: theme.selectedBackground }}
                >
                  <Check className="w-4 h-4" style={{ color: theme.headerColor }} />
                </div>
              )}

              <div className="space-y-2">
                <div
                  className="font-semibold text-sm"
                  style={{ color: theme.headerColor }}
                >
                  {themeDisplayNames[themeName]}
                </div>

                {/* Preview of theme colors */}
                <div className="flex gap-2">
                  <div
                    className="w-8 h-8 rounded-lg"
                    style={{ backgroundColor: theme.background }}
                    title="Background"
                  />
                  <div
                    className="w-8 h-8 rounded-lg"
                    style={{ backgroundColor: theme.selectedBackground }}
                    title="Selected"
                  />
                  <div
                    className="w-8 h-8 rounded-lg border"
                    style={{ borderColor: theme.border }}
                    title="Border"
                  />
                </div>

                {/* Sample text */}
                <div className="text-xs" style={{ color: theme.descriptionColor }}>
                  /command
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="text-xs text-on-surface-variant/70 mt-4">
        This theme affects the appearance of slash command dropdowns (type / in chat)
      </div>
    </div>
  );
}
