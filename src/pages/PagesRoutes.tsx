import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PagesList } from './PagesList';
import { PageEditor } from '../PageBuilder/PageEditor';
import { PageView } from './PageView';

export function PagesRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/pages" replace />} />
      <Route path="/pages" element={<PagesList />} />
      <Route path="/pages/new" element={<PageEditor />} />
      <Route path="/pages/edit/:pageId" element={<PageEditor />} />
      <Route path="/p/:pageSlug" element={<PageView />} />
    </Routes>
  );
}