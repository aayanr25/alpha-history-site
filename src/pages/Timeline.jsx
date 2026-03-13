import React from 'react'
import './Timeline.css'

const events = [
  {
    date: 'Fall 2022',
    title: 'The Beginning',
    description:
      'Placeholder — describe the founding vision, the first conversations, and the people who set things in motion.',
  },
  {
    date: 'Spring 2023',
    title: 'Early Milestones',
    description:
      'Placeholder — early recruitment, first meetings, and the group beginning to take shape.',
  },
  {
    date: 'Summer 2023',
    title: 'Building the Foundation',
    description:
      'Placeholder — off-season growth, planning sessions, and the groundwork laid for the year ahead.',
  },
  {
    date: 'Fall 2023',
    title: 'A New Chapter',
    description:
      'Placeholder — a pivotal semester with new members, events, and momentum carrying the organization forward.',
  },
  {
    date: 'Spring 2024',
    title: 'Expanding the Brotherhood',
    description:
      'Placeholder — notable events, new initiatives, and the brotherhood continuing to grow in size and character.',
  },
  {
    date: 'Summer 2024',
    title: 'Between the Semesters',
    description:
      'Placeholder — summer activities, alumni connections, and preparation for the year to come.',
  },
  {
    date: 'Fall 2024',
    title: 'Strengthening Bonds',
    description:
      'Placeholder — another semester of service, scholarship, and brotherhood setting the tone.',
  },
  {
    date: 'Spring 2025',
    title: 'Continuing the Legacy',
    description:
      "Placeholder — highlights from the semester that continued to define Alpha Epsilon Tau's character.",
  },
  {
    date: 'Fall 2025',
    title: 'Rising Higher',
    description:
      'Placeholder — a landmark semester with events, leadership changes, and growth worth remembering.',
  },
  {
    date: 'Present — Spring 2026',
    title: 'Today',
    description:
      'Placeholder — where things stand right now, and the direction the chapter is headed.',
  },
]

export default function Timeline() {
  return (
    <div className="timeline-page">
      <div className="timeline-header">
        <h1 className="timeline-title">Our History</h1>
        <p className="timeline-subtitle">Alpha Epsilon Tau · Chi Psi · Purdue University</p>
      </div>

      <div className="timeline-container">
        {events.map((event, index) => (
          <div
            key={index}
            className={`timeline-entry ${index % 2 === 0 ? 'entry-left' : 'entry-right'}`}
          >
            <div className="timeline-card">
              <span className="timeline-date">{event.date}</span>
              <h2 className="timeline-event-title">{event.title}</h2>
              <p className="timeline-description">{event.description}</p>
            </div>
            <div className="timeline-node" />
          </div>
        ))}

        <div className="timeline-line" />
      </div>
    </div>
  )
}