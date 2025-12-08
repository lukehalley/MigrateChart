"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface ProjectListItem {
  slug: string;
  name: string;
  primaryColor: string;
  logoUrl: string;
  websiteUrl?: string;
  marketCap?: number;
  volume24h?: number;
  holders?: number;
}

export default function ProjectsSection() {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch("/api/projects");
        if (response.ok) {
          const data = await response.json();
          setProjects(data);
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  const formatNumber = (num?: number) => {
    if (!num) return null;
    if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
    if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `$${(num / 1_000).toFixed(0)}K`;
    return `$${num.toFixed(0)}`;
  };

  const formatCount = (num?: number) => {
    if (!num) return null;
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading || projects.length === 0) {
    return null;
  }

  return (
    <section id="projects" className="projects">
      <div className="projects-container">
        <div className="section-header">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <div className="section-label">SEE IT IN ACTION</div>
            <h2 className="section-title">Complete Histories</h2>
            <p className="section-description">
              Projects That Migrated. Full Price Journey, Launch To Today.
            </p>
          </motion.div>
        </div>

        <div className="projects-grid">
          {projects.map((project, index) => {
            const cleanUrl = project.websiteUrl?.replace(/^https?:\/\//, '').replace(/\/$/, '');

            return (
              <motion.div
                key={project.slug}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                {project.websiteUrl ? (
                  <a
                    href={project.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-card"
                    style={{
                      backgroundColor: `${project.primaryColor}15`,
                      borderColor: `${project.primaryColor}40`,
                    }}
                  >
                    {project.logoUrl && (
                      <img
                        src={project.logoUrl}
                        alt={project.name}
                        className="project-logo"
                        style={{ borderColor: `${project.primaryColor}60` }}
                      />
                    )}
                    <div className="project-name">{project.name}</div>

                    <div className="project-stats">
                      {project.marketCap && (
                        <div className="stat-item">
                          <span className="stat-label">MCap</span>
                          <span className="stat-value" style={{ color: project.primaryColor }}>
                            {formatNumber(project.marketCap)}
                          </span>
                        </div>
                      )}
                      {project.volume24h && (
                        <div className="stat-item">
                          <span className="stat-label">Volume</span>
                          <span className="stat-value" style={{ color: project.primaryColor }}>
                            {formatNumber(project.volume24h)}
                          </span>
                        </div>
                      )}
                      {project.holders && (
                        <div className="stat-item">
                          <span className="stat-label">Holders</span>
                          <span className="stat-value" style={{ color: project.primaryColor }}>
                            {formatCount(project.holders)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="project-url" style={{ color: `${project.primaryColor}cc` }}>
                      {cleanUrl}
                    </div>
                  </a>
                ) : (
                  <Link
                    href={`/${project.slug}`}
                    prefetch={true}
                    className="project-card"
                    style={{
                      backgroundColor: `${project.primaryColor}15`,
                      borderColor: `${project.primaryColor}40`,
                    }}
                  >
                    {project.logoUrl && (
                      <img
                        src={project.logoUrl}
                        alt={project.name}
                        className="project-logo"
                        style={{ borderColor: `${project.primaryColor}60` }}
                      />
                    )}
                    <div className="project-name">{project.name}</div>

                    <div className="project-stats">
                      {project.marketCap && (
                        <div className="stat-item">
                          <span className="stat-label">MCap</span>
                          <span className="stat-value" style={{ color: project.primaryColor }}>
                            {formatNumber(project.marketCap)}
                          </span>
                        </div>
                      )}
                      {project.volume24h && (
                        <div className="stat-item">
                          <span className="stat-label">Volume</span>
                          <span className="stat-value" style={{ color: project.primaryColor }}>
                            {formatNumber(project.volume24h)}
                          </span>
                        </div>
                      )}
                      {project.holders && (
                        <div className="stat-item">
                          <span className="stat-label">Holders</span>
                          <span className="stat-value" style={{ color: project.primaryColor }}>
                            {formatCount(project.holders)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="project-slug">/{project.slug}</div>
                  </Link>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
