import type { EmotionType } from '@/types/index';

/**
 * 감정 유형에 따른 설정 값 (이미지 경로, 라벨, 색상 등)을 정의합니다.
 * 이 설정을 통해 UI 컴포넌트에서 일관된 스타일을 쉽게 적용할 수 있습니다.
 */
export const EMOTION_CONFIG: { 
  [key in EmotionType]: { 
    src: string; 
    label: string; 
    color: string; 
    bgColor: string; 
  } 
} = {
  JOY: { 
    src: '/static/joy.png', 
    label: '기쁨', 
    color: '#FBBF24', // text-yellow-400
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/20' 
  },
  SAD: { 
    src: '/static/sad.png', 
    label: '슬픔', 
    color: '#60A5FA', // text-blue-400
    bgColor: 'bg-blue-50 dark:bg-blue-950/20' 
  },
  ANGER: { 
    src: '/static/anger.png', 
    label: '분노', 
    color: '#F87171', // text-red-400
    bgColor: 'bg-red-50 dark:bg-red-950/20' 
  },
  ANXIETY: { 
    src: '/static/anxiety.png', 
    label: '불안', 
    color: '#a09a8eff', // text-purple-400
    bgColor: 'bg-purple-50 dark:bg-purple-950/20' 
  },
  HATRED: { 
    src: '/static/hatred.png', 
    label: '혐오', 
    color: '#70a86dff', // text-pink-400
    bgColor: 'bg-pink-50 dark:bg-pink-950/20' 
  },
  NEUTRAL: { 
    src: '/static/neutral.png', 
    label: '중립', 
    color: '#aed6d4ff', // text-green-400
    bgColor: 'bg-green-50 dark:bg-green-950/20'
  },
};