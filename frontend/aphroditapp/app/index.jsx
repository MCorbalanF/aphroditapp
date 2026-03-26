import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Image, ScrollView } from 'react-native';
import { Text, Button, Surface, ActivityIndicator, useTheme, Icon } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { authAPI } from '../api/auth';
import { spacing } from '../constants/theme';
import IndexHeader from '@/components/nav/index_header';
import logo from '../assets/images/logo.png'
import LandingLogo from '../assets/images/landing.svg';
import { useNavigation } from 'expo-router';
import * as Application from 'expo-application';

export default function LandingScreen(props) {
  const navigation = useNavigation();
  const theme = useTheme();
  const colors = theme.colors;

  return (
    <ScrollView style={styles.container}>
      <IndexHeader />

      {/* Background gradient */}
      <View style={styles.gradientBg}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <View style={styles.circle3} />
      </View>


      <View style={styles.content}>
        {/* Hero section */}
        <View style={styles.hero}>
      <Text style={styles.appName}>
            {Application.applicationName || process.env.EXPO_PUBLIC_APP_NAME}
          </Text>
          <LandingLogo
            width={400}
            height={400}
            fill={colors.primary}
          />

    
          <Text style={styles.tagline}>
            Tu espacio compartido con las personas que más importan
          </Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          {[
            { icon: 'note-text', label: 'Notas compartidas' },
            { icon: 'calendar-heart', label: 'Eventos especiales' },
            { icon: 'format-list-checkbox', label: 'Listas y checklists' },
            { icon: 'image-multiple', label: 'Momentos en fotos' },
          ].map((f) => (
            <View key={f.label} style={styles.featureItem}>
              <Icon source={f.icon} size={20} color={colors.primary} />
              <Text style={styles.featureText}>{f.label}</Text>
            </View>
          ))}
        </View>

        {/* CTA buttons */}
        <View style={styles.cta}>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('login')}
            style={styles.secondaryBtn}
            contentStyle={styles.btnContent}
            labelStyle={styles.secondaryBtnLabel}
          >
            Iniciar Sesión
          </Button>

          <Button
            mode="contained"
            onPress={() => navigation.navigate('signin')}
            style={styles.primaryBtn}
            contentStyle={styles.btnContent}
            labelStyle={styles.primaryBtnLabel}
          >
            Crear una cuenta
          </Button>

        </View>

        {/* Version */}
        {Application?.nativeApplicationVersion && (
          <Text style={styles.version}>v{Application.nativeBuildVersion || ''}</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: colors.background,
  },
  gradientBg: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: -1,
  },
  circle1: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
    //backgroundColor: colors.pink100,
    top: -100,
    right: -80,
  },
  circle2: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    //backgroundColor: colors.purple100,
    top: 100,
    left: -100,
    opacity: 0.6,
  },
  circle3: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    //backgroundColor: colors.pink100,
    bottom: 100,
    right: -60,
    opacity: 0.4,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'space-between',
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.md,
  },
  iconContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    //backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    //shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  appName: {
    fontSize: 30,
    fontWeight: '800',
    //color: colors.text,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  tagline: {
    fontSize: 16,
    //color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.md,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    //backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    elevation: 2,
    //shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  featureText: {
    fontSize: 13,
    //color: colors.text,
    fontWeight: '500',
  },
  cta: {
    gap: spacing.sm,
  },
  primaryBtn: {
    borderRadius: 28,
    //backgroundColor: colors.primary,
    elevation: 4,
    //shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  secondaryBtn: {
    borderRadius: 28,
    //borderColor: colors.primary,
    borderWidth: 2,
  },
  btnContent: {
    height: 52,
  },
  primaryBtnLabel: {
    fontSize: 16,
    fontWeight: '700',
    //color: '#FFF',
  },
  secondaryBtnLabel: {
    fontSize: 16,
    fontWeight: '700',
    //color: colors.primary,
  },
  version: {
    textAlign: 'center',
    //color: colors.textLight,
    fontSize: 12,
    marginTop: spacing.xs,
  },
});



/*

import { Image,  StyleSheet, useColorScheme, useWindowDimensions, View } from 'react-native';
import {
    useTheme, Text, Button,
} from 'react-native-paper';

import logo from '../assets/images/logo.png'
import { useNavigation } from '@react-navigation/native';
import IndexHeader from '@/components/nav/index_header';



export default function LandingPage() {
    const navigation = useNavigation();

    const { width, height } = useWindowDimensions();
    const isLargeScreen = width >= 768;
    const mainTheme = useTheme();
    const styles = StyleSheet.create({
        main: {
            width: width,
            height: height,

            gap: 10,
            //backgroundColor: theme.colors.background
        },
        img: {
            marginBottom: 30,
            alignSelf: 'center',
        }
    });
    return (

        <View style={styles.main}>
            <IndexHeader />
            <View style={styles.img}>

                <Text variant='displayLarge' style={{ textAlign: 'center', padding: 30 }}>Aphroditapp</Text>
                <Image
                    source={logo}
                    style={{
                        width: isLargeScreen ? 400 : 300,
                        height: isLargeScreen ? 400 : 300
                    }}
                />


            </View>
            <View style={{ margin: 60, gap: 20 }}>
                <Button mode='contained' onPress={() => navigation.navigate('login')}>
                    I´m already a user
                </Button>
                <Button contentStyle={{ paddingHorizontal: 20 }} onPress={() => navigation.navigate('signin')} >
                    Register
                </Button>

            </View>

        </View>

    );
};


*/

