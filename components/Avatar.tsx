import React from 'react';

const IdleAvatar: React.FC = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <style>{`
      .head-bob {
        animation: bob 6s ease-in-out infinite alternate;
      }
      @keyframes bob {
        from {
          transform: translateY(0px);
        }
        to {
          transform: translateY(-2px);
        }
      }
      .eye {
        transform-origin: center;
        animation: blink 4s infinite ease-in-out;
      }
      .eye-right {
        animation-delay: 0.1s;
      }
      @keyframes blink {
        0%, 90%, 100% {
          transform: scaleY(1);
        }
        95% {
          transform: scaleY(0.1);
        }
      }
    `}</style>
    <g className="head-bob">
        {/* Head */}
        <circle cx="50" cy="50" r="40" fill="#4f46e5" />
        {/* Eyes */}
        <circle cx="38" cy="45" r="4" fill="#fff" className="eye eye-left" />
        <circle cx="62" cy="45" r="4" fill="#fff" className="eye eye-right" />
        {/* Mouth */}
        <line x1="45" y1="65" x2="55" y2="65" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </g>
  </svg>
);

const SpeakingAvatar: React.FC = () => (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <style>
        {`
          .mouth-speak {
            animation: speak 0.7s infinite alternate;
          }
          @keyframes speak {
            0% {
              transform: scaleY(1);
            }
            100% {
              transform: scaleY(0.2);
            }
          }
        `}
      </style>
      {/* Head */}
      <circle cx="50" cy="50" r="40" fill="#6366f1" />
      {/* Eyes */}
      <circle cx="38" cy="45" r="4.5" fill="#fff" />
      <circle cx="62" cy="45" r="4.5" fill="#fff" />
      {/* Mouth */}
      <ellipse
        cx="50"
        cy="65"
        rx="8"
        ry="4"
        fill="#fff"
        className="mouth-speak"
        style={{ transformOrigin: '50% 65%' }}
      />
    </svg>
);


interface AvatarProps {
  isSpeaking: boolean;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ isSpeaking, className }) => {
  return (
    <div className={`w-full h-full flex items-center justify-center ${className}`}>
      {isSpeaking ? <SpeakingAvatar /> : <IdleAvatar />}
    </div>
  );
};

export default Avatar;
