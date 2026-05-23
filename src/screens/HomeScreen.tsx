import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import { Language, LANGUAGE_LABELS } from '../config/constants';
import { translateText, transcribeAudio } from '../services/api';
import Waveform from '../components/Waveform';
import ThemeToggle from '../components/ThemeToggle';
import MicIcon from '../components/MicIcon';

const ALL_LANGUAGES: Language[] = ['english', 'hausa', 'yoruba', 'igbo'];

type Theme = 'dark' | 'light';

const COLORS = {
  dark: {
    bg: '#000000',
    surface: '#1c1c1e',
    surfaceElevated: '#2c2c2e',
    text: '#ffffff',
    textSecondary: '#8e8e93',
    textMuted: '#636366',
    primary: '#0a84ff',
    border: '#38383a',
    accent: '#ffffff',
    error: '#ff453a',
  },
  light: {
    bg: '#f0f2f5',
    surface: '#ffffff',
    surfaceElevated: '#e4e6eb',
    text: '#050505',
    textSecondary: '#65676b',
    textMuted: '#8a8d91',
    primary: '#0866ff',
    border: '#dadde1',
    accent: '#050505',
    error: '#e0245e',
  },
};

export default function HomeScreen() {
  const [theme, setTheme] = useState<Theme>('dark');
  const c = COLORS[theme];

  const [sourceLang, setSourceLang] = useState<Language>('english');
  const [targetLang, setTargetLang] = useState<Language>('hausa');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [showLangPicker, setShowLangPicker] = useState<'source' | 'target' | null>(null);
  const [metering, setMetering] = useState(-160);
  const [statusMsg, setStatusMsg] = useState('');   // shows progress text
  const [errorMsg, setErrorMsg] = useState('');     // shows errors

  const styles = useMemo(() => createStyles(c, theme), [theme]);

  function toggleTheme() {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }

  function swapLanguages() {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setInputText(outputText);
    setOutputText(inputText);
    setErrorMsg('');
  }

  async function handleTranslate() {
    if (!inputText.trim()) return;
    setIsTranslating(true);
    setErrorMsg('');
    setStatusMsg('Translating...');
    try {
      const result = await translateText(inputText, sourceLang, targetLang);
      setOutputText(result);
      setStatusMsg('');
    } catch (err: any) {
      setStatusMsg('');
      const msg = err?.message || 'Translation failed';
      // Detect cold-start / timeout
      if (msg.includes('timeout') || msg.includes('Network')) {
        setErrorMsg('Server may be waking up. Wait ~30s and try again.');
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setIsTranslating(false);
    }
  }

  async function startRecording() {
    try {
      setErrorMsg('');
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Microphone access is required');
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        isMeteringEnabled: true,
      });

      rec.setOnRecordingStatusUpdate((status) => {
        if (status.isRecording && typeof status.metering === 'number') {
          setMetering(status.metering);
        }
      });
      rec.setProgressUpdateInterval(80);

      await rec.startAsync();
      setRecording(rec);
      setIsRecording(true);
      setMetering(-160);
    } catch (err) {
      setErrorMsg('Could not start recording');
    }
  }

  async function stopRecording() {
    if (!recording) return;
    setIsRecording(false);
    setIsTranscribing(true);
    setErrorMsg('');
    setStatusMsg('Transcribing your voice...');
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setMetering(-160);
      if (uri) {
        const text = await transcribeAudio(uri, sourceLang);
        setInputText(text);
        setStatusMsg('Translating...');
        const result = await translateText(text, sourceLang, targetLang);
        setOutputText(result);
        setStatusMsg('');
      }
    } catch (err: any) {
      setStatusMsg('');
      const msg = err?.message || 'Could not process recording';
      if (msg.includes('timeout') || msg.includes('Network')) {
        setErrorMsg('Server may be waking up. Wait ~30s and try again.');
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setIsTranscribing(false);
    }
  }

  function selectLanguage(lang: Language) {
    if (showLangPicker === 'source') {
      if (lang === targetLang) setTargetLang(sourceLang);
      setSourceLang(lang);
    } else if (showLangPicker === 'target') {
      if (lang === sourceLang) setSourceLang(targetLang);
      setTargetLang(lang);
    }
    setShowLangPicker(null);
  }

  const isBusy = isTranslating || isTranscribing;

  return (
    <View style={styles.container}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={styles.header}>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
        <Text style={styles.title}>
          <Text style={styles.titleBold}>Naija</Text> Translator
        </Text>
        <View style={{ width: 56 }} />
      </View>

      {/* Main content */}
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <TextInput
            style={styles.input}
            placeholder={`Enter ${LANGUAGE_LABELS[sourceLang]} text...`}
            placeholderTextColor={c.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            textAlignVertical="top"
            editable={!isBusy}
          />

          {inputText.length > 0 && !isRecording && (
            <TouchableOpacity
              style={[styles.translateBtn, isBusy && styles.btnDisabled]}
              onPress={handleTranslate}
              disabled={isBusy}
              activeOpacity={0.8}
            >
              {isTranslating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.translateBtnText}>Translate</Text>
              )}
            </TouchableOpacity>
          )}

          {/* Status message (transcribing/translating) */}
          {statusMsg !== '' && (
            <View style={styles.statusRow}>
              <ActivityIndicator color={c.primary} size="small" />
              <Text style={styles.statusText}>{statusMsg}</Text>
            </View>
          )}

          {/* Error message */}
          {errorMsg !== '' && (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          {/* Output */}
          {outputText.length > 0 && (
            <View style={styles.outputCard}>
              <Text style={styles.outputLabel}>{LANGUAGE_LABELS[targetLang]}</Text>
              <Text style={styles.outputText}>{outputText}</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Language picker modal */}
      {showLangPicker && (
        <TouchableOpacity
          style={styles.pickerOverlay}
          activeOpacity={1}
          onPress={() => setShowLangPicker(null)}
        >
          <View style={styles.pickerCard}>
            <Text style={styles.pickerTitle}>
              Select {showLangPicker === 'source' ? 'source' : 'target'} language
            </Text>
            {ALL_LANGUAGES.map((lang) => {
              const isSelected =
                (showLangPicker === 'source' && lang === sourceLang) ||
                (showLangPicker === 'target' && lang === targetLang);
              return (
                <TouchableOpacity
                  key={lang}
                  style={[
                    styles.pickerOption,
                    isSelected && styles.pickerOptionSelected,
                  ]}
                  onPress={() => selectLanguage(lang)}
                >
                  <Text
                    style={[
                      styles.pickerOptionText,
                      isSelected && styles.pickerOptionTextSelected,
                    ]}
                  >
                    {LANGUAGE_LABELS[lang]}
                  </Text>
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      )}

      {/* Bottom controls */}
      <View style={styles.bottomBar}>
        <View style={styles.langSwitcher}>
          <TouchableOpacity
            style={styles.langPill}
            onPress={() => setShowLangPicker('source')}
            activeOpacity={0.7}
            disabled={isBusy}
          >
            <Text style={styles.langPillText}>{LANGUAGE_LABELS[sourceLang]}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.swapBtn}
            onPress={swapLanguages}
            activeOpacity={0.7}
            disabled={isBusy}
          >
            <Text style={styles.swapIcon}>⇄</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.langPill}
            onPress={() => setShowLangPicker('target')}
            activeOpacity={0.7}
            disabled={isBusy}
          >
            <Text style={styles.langPillText}>{LANGUAGE_LABELS[targetLang]}</Text>
          </TouchableOpacity>
        </View>

        {/* Mic / Waveform */}
        <View style={styles.micRow}>
          {isRecording ? (
            <View style={styles.recordingContainer}>
              <View style={styles.waveformBox}>
                <Waveform color={c.text} metering={metering} />
              </View>
              <TouchableOpacity
                style={styles.stopBtn}
                onPress={stopRecording}
                activeOpacity={0.8}
              >
                <View style={styles.stopSquare} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.micBtn,
                isTranscribing && styles.micBtnDisabled,
              ]}
              onPress={startRecording}
              disabled={isBusy}
              activeOpacity={0.8}
            >
              {isTranscribing ? (
                <ActivityIndicator color="#fff" size="large" />
              ) : (
                <MicIcon size={30} color="#ffffff" />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const createStyles = (c: typeof COLORS.dark, theme: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    header: {
      paddingTop: 56,
      paddingHorizontal: 20,
      paddingBottom: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: { fontSize: 18, color: c.text, fontWeight: '400' },
    titleBold: { fontWeight: '700' },

    content: { flex: 1 },
    scrollContent: { padding: 20, paddingBottom: 40, flexGrow: 1 },
    input: {
      fontSize: 28,
      color: c.text,
      minHeight: 180,
      paddingVertical: 10,
      lineHeight: 36,
    },
    translateBtn: {
      backgroundColor: c.primary,
      paddingVertical: 14,
      paddingHorizontal: 28,
      borderRadius: 24,
      alignSelf: 'flex-start',
      marginTop: 16,
    },
    btnDisabled: { opacity: 0.5 },
    translateBtnText: {
      color: '#ffffff',
      fontSize: 15,
      fontWeight: '600',
    },

    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 20,
      gap: 10,
    },
    statusText: {
      color: c.textSecondary,
      fontSize: 15,
      fontWeight: '500',
    },

    errorCard: {
      marginTop: 20,
      padding: 14,
      backgroundColor: theme === 'dark' ? '#2c1416' : '#ffeaec',
      borderRadius: 12,
      borderLeftWidth: 3,
      borderLeftColor: c.error,
    },
    errorText: {
      color: c.error,
      fontSize: 14,
      lineHeight: 20,
    },

    outputCard: {
      marginTop: 28,
      padding: 18,
      backgroundColor: c.surface,
      borderRadius: 14,
    },
    outputLabel: {
      fontSize: 11,
      color: c.textSecondary,
      fontWeight: '600',
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    outputText: {
      fontSize: 22,
      color: c.text,
      lineHeight: 30,
      fontWeight: '400',
    },

    bottomBar: {
      backgroundColor: c.surface,
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 28,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      borderTopWidth: theme === 'light' ? 1 : 0,
      borderTopColor: c.border,
    },
    langSwitcher: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    langPill: {
      flex: 1,
      backgroundColor: c.surfaceElevated,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
    },
    langPillText: { color: c.text, fontSize: 14, fontWeight: '500' },
    swapBtn: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 8,
    },
    swapIcon: { color: c.textSecondary, fontSize: 22 },

    micRow: { alignItems: 'center', minHeight: 72, justifyContent: 'center' },
    micBtn: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: c.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: c.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    micBtnDisabled: { backgroundColor: c.textMuted },

    recordingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      gap: 12,
      paddingHorizontal: 4,
    },
    waveformBox: {
      flex: 1,
      height: 56,
      borderRadius: 28,
      backgroundColor: c.surfaceElevated,
      justifyContent: 'center',
      paddingHorizontal: 16,
    },
    stopBtn: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: '#ff3b30',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#ff3b30',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    stopSquare: {
      width: 18,
      height: 18,
      borderRadius: 3,
      backgroundColor: '#fff',
    },

    pickerOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 100,
      padding: 20,
    },
    pickerCard: {
      backgroundColor: c.surface,
      borderRadius: 16,
      padding: 8,
      width: '90%',
      maxWidth: 400,
    },
    pickerTitle: {
      color: c.textSecondary,
      fontSize: 13,
      fontWeight: '600',
      paddingVertical: 12,
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    pickerOption: {
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderRadius: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    pickerOptionSelected: { backgroundColor: c.surfaceElevated },
    pickerOptionText: { color: c.text, fontSize: 16, fontWeight: '500' },
    pickerOptionTextSelected: { color: c.primary, fontWeight: '600' },
    checkmark: { color: c.primary, fontSize: 18, fontWeight: '700' },
  });