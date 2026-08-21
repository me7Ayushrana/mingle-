import { BlurView } from 'expo-blur';
import { memo, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { MoodType } from '@/constants/moods';
import { moodGradients } from '@/theme/gradients';
import { colors } from '@/theme/colors';

interface GradientBackgroundProps {
  children: ReactNode;
  mood?: MoodType;
  fullScreen?: boolean;
}

export const GradientBackground = memo(function GradientBackground({
  children,
  mood,
}: GradientBackgroundProps) {
  const insets = useSafeAreaInsets();
  
  // Use the mood color if available, otherwise a subtle primary tint for the glow
  const glowColor = mood ? moodGradients[mood][0] : colors.primaryLight;

  return (
    <View style={styles.container}>
      {/* Background Glow Node */}
      <View style={[styles.glowNode, { backgroundColor: glowColor }]} />
      
      {/* Intense blur to scatter the light, creating a soft radial glow */}
      <BlurView 
        intensity={100} 
        tint="dark" 
        style={StyleSheet.absoluteFill} 
        experimentalBlurMethod="dimezisBlurView"
      />
      
      <View style={[styles.content, { paddingTop: insets.top }]}>{children}</View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050508', // Deepest dark gray, almost black
    overflow: 'hidden',
  },
  glowNode: {
    position: 'absolute',
    top: -150,
    alignSelf: 'center',
    width: 350,
    height: 350,
    borderRadius: 175,
    opacity: 0.35, // Soft intensity
  },
  content: {
    flex: 1,
  },
});
