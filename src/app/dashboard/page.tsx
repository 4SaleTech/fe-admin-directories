'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/presentation/components/AdminLayout/AdminLayout';
import { businessAdminRepository } from '@/infrastructure/repositories/BusinessAdminRepository';
import { categoryAdminRepository } from '@/infrastructure/repositories/CategoryAdminRepository';
import { sectionAdminRepository } from '@/infrastructure/repositories/SectionAdminRepository';
import { tagAdminRepository } from '@/infrastructure/repositories/TagAdminRepository';
import styles from './dashboard.module.scss';

interface Stats {
  totalBusinesses: number;
  activeBusinesses: number;
  pendingBusinesses: number;
  totalCategories: number;
  totalSections: number;
  totalTags: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const [businessesRes, categoriesRes, sectionsRes, tagsRes] = await Promise.all([
        businessAdminRepository.getAll({ page: 1, limit: 1 }),
        categoryAdminRepository.getAll(),
        sectionAdminRepository.getAll(),
        tagAdminRepository.getAll(),
      ]);

      const activeRes = await businessAdminRepository.getAll({
        page: 1,
        limit: 1,
        status: 'active',
      });

      const pendingRes = await businessAdminRepository.getAll({
        page: 1,
        limit: 1,
        status: 'pending',
      });

      setStats({
        totalBusinesses: businessesRes.pagination?.total || 0,
        activeBusinesses: activeRes.pagination?.total || 0,
        pendingBusinesses: pendingRes.pagination?.total || 0,
        totalCategories: categoriesRes.data?.length || 0,
        totalSections: sectionsRes.data?.length || 0,
        totalTags: tagsRes.data?.length || 0,
      });
    } catch (err: any) {
      console.error('Failed to load stats:', err);
      setError('Failed to load dashboard statistics');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className={styles.dashboard}>
        <h1 className={styles.title}>Dashboard</h1>

        {error && <div className="error">{error}</div>}

        {isLoading ? (
          <div className="loading">Loading statistics...</div>
        ) : stats ? (
          <div className={styles.statsGrid}>
            <div className={`${styles.statCard} ${styles.primary}`}>
              <div className={styles.statIcon}>🏢</div>
              <div className={styles.statContent}>
                <h3>Total Businesses</h3>
                <p className={styles.statNumber}>{stats.totalBusinesses}</p>
              </div>
            </div>

            <div className={`${styles.statCard} ${styles.success}`}>
              <div className={styles.statIcon}>✅</div>
              <div className={styles.statContent}>
                <h3>Active Businesses</h3>
                <p className={styles.statNumber}>{stats.activeBusinesses}</p>
              </div>
            </div>

            <div className={`${styles.statCard} ${styles.warning}`}>
              <div className={styles.statIcon}>⏳</div>
              <div className={styles.statContent}>
                <h3>Pending Businesses</h3>
                <p className={styles.statNumber}>{stats.pendingBusinesses}</p>
              </div>
            </div>

            <div className={`${styles.statCard} ${styles.info}`}>
              <div className={styles.statIcon}>📁</div>
              <div className={styles.statContent}>
                <h3>Categories</h3>
                <p className={styles.statNumber}>{stats.totalCategories}</p>
              </div>
            </div>

            <div className={`${styles.statCard} ${styles.info}`}>
              <div className={styles.statIcon}>📑</div>
              <div className={styles.statContent}>
                <h3>Sections</h3>
                <p className={styles.statNumber}>{stats.totalSections}</p>
              </div>
            </div>

            <div className={`${styles.statCard} ${styles.info}`}>
              <div className={styles.statIcon}>🏷️</div>
              <div className={styles.statContent}>
                <h3>Tags</h3>
                <p className={styles.statNumber}>{stats.totalTags}</p>
              </div>
            </div>
          </div>
        ) : null}

        <div className={styles.quickActions}>
          <h2>Quick Actions</h2>
          <div className={styles.actionsGrid}>
            <a href="/businesses" className={`${styles.actionCard} card`}>
              <h3>Manage Businesses</h3>
              <p>View, edit, verify, and manage all businesses</p>
            </a>
            <a href="/categories" className={`${styles.actionCard} card`}>
              <h3>Manage Categories</h3>
              <p>Organize and update business categories</p>
            </a>
            <a href="/sections" className={`${styles.actionCard} card`}>
              <h3>Manage Sections</h3>
              <p>Configure homepage sections</p>
            </a>
            <a href="/filters" className={`${styles.actionCard} card`}>
              <h3>Manage Filters</h3>
              <p>Setup search and filter options</p>
            </a>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
