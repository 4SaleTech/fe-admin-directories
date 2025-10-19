'use client';

import { useState } from 'react';
import { FiGrid, FiUpload, FiLink, FiSearch } from 'react-icons/fi';
import ImageUploader from '@/presentation/components/ImageUploader/ImageUploader';
import IconRenderer from '@/presentation/components/IconRenderer/IconRenderer';
import { searchIcons, ICON_CATEGORIES, IconCategory } from '@/domain/entities/IconLibrary';
import { UploadedFile } from '@/domain/entities/FileUpload';
import styles from './IconPicker.module.scss';

interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

type TabType = 'icons' | 'upload' | 'url';

export default function IconPicker({ value, onChange, label = 'Icon / Logo' }: IconPickerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('icons');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<IconCategory>('All');
  const [manualUrl, setManualUrl] = useState(value && !value.startsWith('ri://') ? value : '');

  // Get filtered icons based on search and category
  const filteredIcons = searchIcons(searchQuery, selectedCategory);

  const handleIconSelect = (iconName: string) => {
    onChange(`ri://${iconName}`);
  };

  const handleImageUpload = (files: UploadedFile[]) => {
    if (files.length > 0) {
      onChange(files[0].url);
    }
  };

  const handleUrlChange = (url: string) => {
    setManualUrl(url);
    onChange(url);
  };

  return (
    <div className={styles.iconPicker}>
      {label && <label className={styles.label}>{label}</label>}

      {/* Preview */}
      {value && (
        <div className={styles.preview}>
          <IconRenderer value={value} size={48} />
          <span className={styles.previewLabel}>Current Selection</span>
        </div>
      )}

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'icons' ? styles.active : ''}`}
          onClick={() => setActiveTab('icons')}
          type="button"
        >
          <FiGrid />
          <span>Icons</span>
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'upload' ? styles.active : ''}`}
          onClick={() => setActiveTab('upload')}
          type="button"
        >
          <FiUpload />
          <span>Upload</span>
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'url' ? styles.active : ''}`}
          onClick={() => setActiveTab('url')}
          type="button"
        >
          <FiLink />
          <span>URL</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {/* Icons Tab */}
        {activeTab === 'icons' && (
          <div className={styles.iconsTab}>
            {/* Search */}
            <div className={styles.searchBar}>
              <FiSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search icons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            {/* Category Filter */}
            <div className={styles.categoryFilter}>
              {ICON_CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`${styles.categoryButton} ${
                    selectedCategory === category ? styles.active : ''
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Icons Grid */}
            <div className={styles.iconsGrid}>
              {filteredIcons.map((iconDef) => {
                const IconComponent = iconDef.icon;
                const isSelected = value === `ri://${iconDef.name}`;
                return (
                  <button
                    key={iconDef.name}
                    type="button"
                    className={`${styles.iconButton} ${isSelected ? styles.selected : ''}`}
                    onClick={() => handleIconSelect(iconDef.name)}
                    title={iconDef.name}
                  >
                    <IconComponent size={24} />
                  </button>
                );
              })}
            </div>

            {filteredIcons.length === 0 && (
              <div className={styles.noResults}>
                No icons found matching "{searchQuery}"
              </div>
            )}
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className={styles.uploadTab}>
            <ImageUploader
              single={true}
              label=""
              helpText="Upload an image (max 15MB)"
              defaultImages={value && !value.startsWith('ri://') ? [value] : []}
              onUploadComplete={handleImageUpload}
            />
          </div>
        )}

        {/* URL Tab */}
        {activeTab === 'url' && (
          <div className={styles.urlTab}>
            <p className={styles.urlHelp}>
              Enter the URL of an image or emoji to use as the icon
            </p>
            <input
              type="text"
              placeholder="https://example.com/icon.png or 🏷️"
              value={manualUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              className={styles.urlInput}
            />
          </div>
        )}
      </div>
    </div>
  );
}
