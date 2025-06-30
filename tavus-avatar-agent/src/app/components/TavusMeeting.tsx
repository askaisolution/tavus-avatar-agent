'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Mic, MicOff, Video, VideoOff, Monitor, MonitorOff,
  Volume2, VolumeX, PhoneOff
} from 'lucide-react';
import { getOrCreateCallObject, destroyCallObject } from '@/lib/dailyClient';

const TavusMeeting = () => {
  const callRef = useRef<any>(null);
  const [remoteTrack, setRemoteTrack] = useState<MediaStreamTrack | null>(null);
  const [localTrack, setLocalTrack] = useState<MediaStreamTrack | null>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isScreenOn, setIsScreenOn] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(true);

  useEffect(() => {
    const start = async () => {
      const res = await fetch('/api/tavus-convo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          replica_id: 'rf4703150052',
          persona_id: 'p45bdf5c895c',
          conversation_name: 'Phillip Wilson Demo',
          conversation_context: 'Hello, I am Phillip Wilson...',
        }),
      });

      const { url } = await res.json();
      if (!url?.startsWith('https://')) return alert('Invalid URL');

      const call = getOrCreateCallObject();
      callRef.current = call;
      await call.join({ url });

      const update = () => {
        const parts = call.participants();
        const local = parts.local;
        const remote = Object.entries(parts).find(([id]) => id !== 'local')?.[1] as any;

        if (local?.tracks.video?.persistentTrack) {
          setLocalTrack(local.tracks.video.persistentTrack);
        }
        if (remote?.tracks.video?.persistentTrack) {
          setRemoteTrack(remote.tracks.video.persistentTrack);
        }
      };

      call.on('participant-joined', update);
      call.on('participant-updated', update);
      call.on('participant-left', update);
    };

    start();

    return () => {
      callRef.current?.leave();
      destroyCallObject(); // ✅ clean up the singleton
    };
  }, []);

  const toggleMic = () => {
    const state = callRef.current?.localAudio();
    callRef.current?.setLocalAudio(!state);
    setIsMicOn(!state);
  };

  const toggleCam = () => {
    const state = callRef.current?.localVideo();
    callRef.current?.setLocalVideo(!state);
    setIsCamOn(!state);
  };

  const toggleScreen = async () => {
    if (isScreenOn) {
      await callRef.current?.stopScreenShare();
    } else {
      await callRef.current?.startScreenShare();
    }
    setIsScreenOn(!isScreenOn);
  };

  const toggleSpeaker = () => {
    setIsAudioOn(!isAudioOn);
    // Optional: Control audio gain or mute remote stream volume
  };

  const leave = () => {
    callRef.current?.leave();
    destroyCallObject();
    setRemoteTrack(null);
    setLocalTrack(null);
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden rounded-xl">
      {/* Replica video (full screen) */}
      {remoteTrack && (
        <video
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          ref={(el) => {
            if (el) el.srcObject = new MediaStream([remoteTrack]);
          }}
        />
      )}

      {/* Local PiP (bottom right) */}
      {localTrack && (
        <div className="fixed bottom-5 right-5 w-48 h-32 rounded-xl overflow-hidden z-20 shadow-lg border border-white/10">
          <video
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            ref={(el) => {
              if (el) el.srcObject = new MediaStream([localTrack]);
            }}
          />
        </div>
      )}

      {/* Centered Controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        <button onClick={toggleMic} className="control-btn">
          {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
        </button>
        <button onClick={toggleCam} className="control-btn">
          {isCamOn ? <Video size={20} /> : <VideoOff size={20} />}
        </button>
        <button onClick={toggleScreen} className="control-btn">
          {isScreenOn ? <MonitorOff size={20} /> : <Monitor size={20} />}
        </button>
        <button onClick={toggleSpeaker} className="control-btn">
          {isAudioOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
        <button
          onClick={leave}
          className="w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center"
        >
          <PhoneOff size={20} />
        </button>
      </div>
    </div>
  );
};

export default TavusMeeting;
