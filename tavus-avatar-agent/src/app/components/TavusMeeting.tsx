'use client';

import React, { useEffect, useRef, useState } from 'react';
import DailyIframe from '@daily-co/daily-js';

const getOrCreateCallObject = () => {
  if (!window._dailyCallObject) {
    window._dailyCallObject = DailyIframe.createCallObject();
  }
  return window._dailyCallObject;
};

const TavusMeeting = () => {
  const callRef = useRef<any>(null);
  const [remoteParticipants, setRemoteParticipants] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchTavusUrl = async () => {
      try {
        const response = await fetch('/api/tavus-convo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            replica_id: "rf4703150052",
            persona_id: "p45bdf5c895c",
            conversation_name: "Chat with Phillip Wilson - Relax Saunas",
            conversation_context: `Hello, I'm Phillip Wilson...`,
          }),
        });

        const data = await response.json();
        const url = data.url;

        if (!url?.startsWith('https://')) {
          alert("Failed to get conversation URL");
          return;
        }

        const call = getOrCreateCallObject();
        callRef.current = call;

        await call.join({ url });

        const updateRemoteParticipants = () => {
          const participants = call.participants();
          const remotes: Record<string, any> = {};
          Object.entries(participants).forEach(([id, p]) => {
            if (id !== 'local') remotes[id] = p;
          });
          setRemoteParticipants(remotes);
        };

        call.on('participant-joined', updateRemoteParticipants);
        call.on('participant-updated', updateRemoteParticipants);
        call.on('participant-left', updateRemoteParticipants);
      } catch (err) {
        console.error("Error fetching Tavus URL", err);
        alert("Something went wrong while starting the conversation.");
      }
    };

    fetchTavusUrl();

    return () => {
      callRef.current?.leave();
    };
  }, []);

  useEffect(() => {
    Object.entries(remoteParticipants).forEach(([id, p]) => {
      const videoEl = document.getElementById(`remote-video-${id}`) as HTMLVideoElement | null;
      if (videoEl && p.tracks.video?.state === 'playable') {
        videoEl.srcObject = new MediaStream([p.tracks.video.persistentTrack]);
      }

      const audioEl = document.getElementById(`remote-audio-${id}`) as HTMLAudioElement | null;
      if (audioEl && p.tracks.audio?.state === 'playable') {
        audioEl.srcObject = new MediaStream([p.tracks.audio.persistentTrack]);
      }
    });
  }, [remoteParticipants]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <header className="bg-gray-800 p-4 flex justify-between items-center">
        <span className="font-semibold">Tavus Meeting (Daily Custom UI)</span>
      </header>
      <main className="flex-1 p-4 grid grid-cols-2 md:grid-cols-4 gap-2">
        {Object.entries(remoteParticipants).map(([id, p]) => (
          <div
            key={id}
            className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video w-48"
          >
            <video
              id={`remote-video-${id}`}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <audio id={`remote-audio-${id}`} autoPlay playsInline />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
              {p.user_name || id.slice(-4)}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default TavusMeeting;
