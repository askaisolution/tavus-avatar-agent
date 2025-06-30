'use client';
import dynamic from 'next/dynamic';
import DemoHeader from '../components/DemoHeader';

const TavusMeeting = dynamic(() => import('../components/TavusMeeting'), {
  ssr: false,
});

export default function Demo1() {
  return (
    <div className="bg-white min-h-screen p-8">
      <DemoHeader title="Demo 1" />
      <p className="mb-6 text-gray-700">This is the content of Demo 1.</p>
      <TavusMeeting />
    </div>
  );
}
