import { useEffect, useRef } from 'react';
import DailyIframe from '@daily-co/daily-js';
import toast from 'react-hot-toast';

const VideoMeeting = ({ roomUrl, onLeave, userName }) => {
  const callFrameRef = useRef(null);

  useEffect(() => {
    console.log('🎥 VideoMeeting mounting...');
    console.log('🔗 Room URL:', roomUrl);

    if (!roomUrl) {
      toast.error('No meeting URL provided!');
      return;
    }

    // Cleanup any existing frame
    if (callFrameRef.current) {
      console.log('🧹 Destroying existing frame...');
      callFrameRef.current.destroy();
      callFrameRef.current = null;
    }

    try {
      console.log('📹 Creating Daily.co frame...');
      
      const frame = DailyIframe.createFrame({
        iframeStyle: {
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          border: '0',
          zIndex: '9999'
        },
        showLeaveButton: true,
        showFullscreenButton: true
      });

      callFrameRef.current = frame;

      console.log('✅ Frame created, joining room...');

      frame.join({
        url: roomUrl,
        userName: userName || 'Guest'
      });

      frame.on('joined-meeting', () => {
        console.log('✅ Successfully joined meeting!');
        toast.success('Joined meeting! 🎥');
      });

      frame.on('left-meeting', () => {
        console.log('👋 Left meeting');
        toast.success('Left meeting');
        if (onLeave) onLeave();
      });

      frame.on('error', (error) => {
        console.error('❌ Daily.co error:', error);
        toast.error('Meeting error: ' + error.errorMsg);
      });

    } catch (error) {
      console.error('❌ Failed to create frame:', error);
      toast.error('Failed to create meeting');
    }

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up VideoMeeting...');
      if (callFrameRef.current) {
        callFrameRef.current.destroy();
        callFrameRef.current = null;
      }
    };
  }, [roomUrl, userName, onLeave]);

  return null; // Daily.co creates its own iframe
};

export default VideoMeeting;
