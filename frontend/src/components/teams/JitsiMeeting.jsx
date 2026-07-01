import { JitsiMeeting } from '@jitsi/react-sdk';
import { useRef, useEffect } from 'react';
import toast from 'react-hot-toast';

const JitsiMeetingComponent = ({ roomName, userName, onLeave }) => {
  const apiRef = useRef(null);
  const hasJoinedRef = useRef(false);

  const handleApiReady = (api) => {
    console.log('✅ Jitsi API Ready!');
    apiRef.current = api;

    // ✅ Track when user actually joins
    api.addEventListener('videoConferenceJoined', () => {
      console.log('✅ Successfully joined meeting!');
      hasJoinedRef.current = true;
      toast.success('Joined meeting! 🎥');
    });

    // ✅ Only call onLeave if user actually joined first
    api.addEventListener('videoConferenceLeft', () => {
      console.log('👋 Left meeting');
      
      // Only trigger onLeave if user had actually joined
      if (hasJoinedRef.current) {
        console.log('✅ User was in meeting, calling onLeave');
        toast.success('Left meeting');
        if (onLeave) onLeave();
      } else {
        console.log('⚠️ User never joined, not calling onLeave');
      }
    });

    // Participant events
    api.addEventListener('participantJoined', (participant) => {
      console.log('👤 Participant joined:', participant.displayName);
    });

    api.addEventListener('participantLeft', (participant) => {
      console.log('👋 Participant left:', participant.displayName);
    });

    // Error handling
    api.addEventListener('errorOccurred', (error) => {
      console.error('❌ Meeting error:', error);
      toast.error('Meeting error occurred');
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Cleaning up Jitsi component');
      hasJoinedRef.current = false;
    };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 9999,
      backgroundColor: '#000'
    }}>
      <JitsiMeeting
        roomName={roomName}
        configOverwrite={{
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          disableModeratorIndicator: false,
          enableWelcomePage: false,
          prejoinPageEnabled: true, // ✅ Keep pre-join screen
          disableInviteFunctions: false,
          subject: 'Team Meeting', // ✅ Meeting title
          hideConferenceSubject: false
        }}
        interfaceConfigOverwrite={{
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_BRAND_WATERMARK: false,
          MOBILE_APP_PROMO: false,
          TOOLBAR_BUTTONS: [
            'microphone',
            'camera',
            'closedcaptions',
            'desktop',
            'fullscreen',
            'fodeviceselection',
            'hangup',
            'profile',
            'chat',
            'recording',
            'livestreaming',
            'etherpad',
            'sharedvideo',
            'settings',
            'raisehand',
            'videoquality',
            'filmstrip',
            'invite',
            'feedback',
            'stats',
            'shortcuts',
            'tileview',
            'videobackgroundblur',
            'download',
            'help',
            'mute-everyone',
            'security'
          ]
        }}
        userInfo={{
          displayName: userName || 'Guest',
          email: ''
        }}
        onApiReady={handleApiReady}
        getIFrameRef={(iframeRef) => {
          if (iframeRef) {
            iframeRef.style.height = '100%';
            iframeRef.style.width = '100%';
            iframeRef.style.border = 'none';
          }
        }}
      />
    </div>
  );
};

export default JitsiMeetingComponent;
