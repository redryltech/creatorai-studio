'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/layout/page-header';

const memoryTabs = [
  { id: 'writing', label: 'Writing Style', icon: '✍️' },
  { id: 'audience', label: 'Audience', icon: '👥' },
  { id: 'strategy', label: 'Strategy', icon: '🎯' },
  { id: 'presets', label: 'Prompt Presets', icon: '📋' },
  { id: 'rules', label: 'Rules & Restrictions', icon: '🚫' },
];

export default function WorkspacePage() {
  return (
    <div className="h-screen flex flex-col">
      <PageHeader title="AI Memory" badge={<Badge variant="info">Workspace-level</Badge>} actions={<Button size="sm" variant="secondary">Save Changes</Button>} />

      <div className="flex-1 overflow-y-auto p-6 max-w-4xl">
        <div className="mb-6">
          <p className="text-sm text-surface-400">
            AI Memory is persistent knowledge that all agents use when creating content for this workspace.
            Configure your brand voice, target audience, and content rules here.
          </p>
        </div>

        <Tabs tabs={memoryTabs} defaultTab="writing">
          {(tab) => (
            <div className="space-y-4">
              {tab === 'writing' && (
                <>
                  <Card>
                    <CardHeader><CardTitle>Tone & Persona</CardTitle></CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs text-surface-400 mb-1 block">Tone</label>
                          <input className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-100 focus:ring-2 focus:ring-brand-500 focus:outline-none" placeholder="e.g., Professional but approachable, with a touch of humor" />
                        </div>
                        <div>
                          <label className="text-xs text-surface-400 mb-1 block">AI Persona</label>
                          <textarea className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-100 focus:ring-2 focus:ring-brand-500 focus:outline-none min-h-[80px]" placeholder="e.g., You are a tech industry insider who explains complex topics simply..." />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="text-xs text-surface-400 mb-1 block">Vocabulary</label>
                            <select className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-100">
                              <option>Simple</option>
                              <option>Moderate</option>
                              <option>Advanced</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs text-surface-400 mb-1 block">Sentence Length</label>
                            <select className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-100">
                              <option>Short</option>
                              <option>Medium</option>
                              <option>Long</option>
                            </select>
                          </div>
                          <div className="flex items-end gap-4 pb-2">
                            <label className="flex items-center gap-2 text-xs text-surface-300 cursor-pointer">
                              <input type="checkbox" className="rounded border-surface-600 bg-surface-800 text-brand-500 focus:ring-brand-500" />
                              Use emojis
                            </label>
                            <label className="flex items-center gap-2 text-xs text-surface-300 cursor-pointer">
                              <input type="checkbox" defaultChecked className="rounded border-surface-600 bg-surface-800 text-brand-500 focus:ring-brand-500" />
                              Use hashtags
                            </label>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle>Example Phrases</CardTitle></CardHeader>
                    <CardContent>
                      <p className="text-xs text-surface-400 mb-3">Add phrases that capture your brand voice. The AI will learn from these.</p>
                      <textarea className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-100 min-h-[80px] focus:ring-2 focus:ring-brand-500 focus:outline-none"
                        placeholder={"One phrase per line:\nDid you know that...\nHere's the thing nobody talks about...\nLet me break this down for you..."} />
                    </CardContent>
                  </Card>
                </>
              )}

              {tab === 'audience' && (
                <Card>
                  <CardHeader><CardTitle>Target Audience</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-surface-400 mb-1 block">Primary Age Range</label>
                        <input className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-100 focus:ring-2 focus:ring-brand-500 focus:outline-none" placeholder="e.g., 18-35" />
                      </div>
                      <div>
                        <label className="text-xs text-surface-400 mb-1 block">Interests (comma-separated)</label>
                        <input className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-100 focus:ring-2 focus:ring-brand-500 focus:outline-none" placeholder="e.g., Technology, AI, Startups, Productivity" />
                      </div>
                      <div>
                        <label className="text-xs text-surface-400 mb-1 block">Pain Points</label>
                        <textarea className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-100 min-h-[60px] focus:ring-2 focus:ring-brand-500 focus:outline-none" placeholder="What problems does your audience face?" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {tab === 'strategy' && (
                <Card>
                  <CardHeader><CardTitle>Content Strategy</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-surface-400 mb-1 block">Content Pillars (one per line)</label>
                        <textarea className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-100 min-h-[80px] focus:ring-2 focus:ring-brand-500 focus:outline-none" placeholder={"AI tutorials\nIndustry news\nBehind the scenes\nProduct reviews"} />
                      </div>
                      <div>
                        <label className="text-xs text-surface-400 mb-1 block">Content Goals</label>
                        <textarea className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-100 min-h-[60px] focus:ring-2 focus:ring-brand-500 focus:outline-none" placeholder={"Grow subscribers to 100K\nDrive traffic to website\nEstablish thought leadership"} />
                      </div>
                      <div>
                        <label className="text-xs text-surface-400 mb-1 block">Preferred Call-to-Actions</label>
                        <textarea className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-100 min-h-[60px] focus:ring-2 focus:ring-brand-500 focus:outline-none" placeholder={"Like and subscribe for more!\nDrop your thoughts in the comments\nFollow for daily content"} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {tab === 'rules' && (
                <Card>
                  <CardHeader><CardTitle>Rules & Restrictions</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-surface-400 mb-1 block">Key Facts (the AI will always remember these)</label>
                        <textarea className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-100 min-h-[60px] focus:ring-2 focus:ring-brand-500 focus:outline-none" placeholder={"One fact per line:\nCompany was founded in 2024\nHQ is in San Francisco"} />
                      </div>
                      <div>
                        <label className="text-xs text-surface-400 mb-1 block">Restrictions (the AI will NEVER do these)</label>
                        <textarea className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-100 min-h-[60px] focus:ring-2 focus:ring-brand-500 focus:outline-none" placeholder={"Never mention competitors by name\nDon't make political statements\nDon't use profanity"} />
                      </div>
                      <div>
                        <label className="text-xs text-surface-400 mb-1 block">Global Negative Prompts (always appended to image generation)</label>
                        <textarea className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-100 min-h-[60px] focus:ring-2 focus:ring-brand-500 focus:outline-none" placeholder="blurry, low quality, watermark, text overlay, nsfw" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {tab === 'presets' && (
                <EmptyState
                  icon="📋"
                  title="No prompt presets"
                  description="Create reusable prompt fragments that agents will use automatically."
                  actionLabel="Add Preset"
                  onAction={() => {}}
                />
              )}
            </div>
          )}
        </Tabs>
      </div>
    </div>
  );
}
