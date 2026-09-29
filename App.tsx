import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type Screen = 'home' | 'players' | 'game' | 'results';

type Player = {
  id: string;
  name: string;
  score: number;
};

const ROUND_COUNT = 3;
const TURN_SECONDS = 5;

const QUICK_3_PROMPTS = [
  'Name 3 things you would never take on a first date.',
  'Name 3 countries beginning with S.',
  'Name 3 animals that can swim.',
  'Name 3 things you should not say to your boss.',
  'Name 3 things you find in a garage.',
  'Name 3 famous football clubs.',
  'Name 3 things you bring on a road trip.',
  'Name 3 foods you can eat with your hands.',
  'Name 3 things that are usually cold.',
  'Name 3 things you can find at the beach.',
  'Name 3 things people do before going to bed.',
  'Name 3 jobs that require a uniform.',
  'Name 3 things you would pack for a cabin trip.',
  'Name 3 things that can make you late.',
  'Name 3 things you can buy at a petrol station.',
  'Name 3 things that are round.',
  'Name 3 animals with four legs.',
  'Name 3 things people lose often.',
  'Name 3 things you can do on a rainy day.',
  'Name 3 things found in a kitchen.',
  'Name 3 things you should not forget on holiday.',
  'Name 3 things that make a loud noise.',
  'Name 3 sports played with a ball.',
  'Name 3 things you can wear on your head.',
  'Name 3 things you see in a city.',
  'Name 3 things people celebrate.',
  'Name 3 things that can be made of wood.',
  'Name 3 things you can find in a classroom.',
  'Name 3 things you might see in Norway.',
  'Name 3 things you can do with friends.',
];

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [names, setNames] = useState<string[]>(['', '']);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [turnNumber, setTurnNumber] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(TURN_SECONDS);
  const [timerFinished, setTimerFinished] = useState(false);
  const [promptDeck, setPromptDeck] = useState<string[]>(() => shuffle(QUICK_3_PROMPTS));
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalTurns = players.length * ROUND_COUNT;
  const currentPlayer = players[currentPlayerIndex];
  const currentPrompt = promptDeck[turnNumber % promptDeck.length] ?? QUICK_3_PROMPTS[0];
  const roundNumber = players.length > 0 ? Math.floor(turnNumber / players.length) + 1 : 1;

  const sortedPlayers = useMemo(
    () => [...players].sort((a, b) => b.score - a.score),
    [players],
  );

  useEffect(() => {
    if (screen !== 'game') {
      return;
    }

    setSecondsLeft(TURN_SECONDS);
    setTimerFinished(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setSecondsLeft((value) => {
        if (value <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          setTimerFinished(true);
          return 0;
        }
        return value - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [screen, turnNumber]);

  const updateName = (index: number, value: string) => {
    setNames((current) => current.map((name, i) => (i === index ? value : name)));
  };

  const addPlayerField = () => {
    if (names.length < 8) {
      setNames((current) => [...current, '']);
    }
  };

  const removePlayerField = (index: number) => {
    if (names.length <= 2) {
      return;
    }
    setNames((current) => current.filter((_, i) => i !== index));
  };

  const startGame = () => {
    const cleanNames = names.map((name) => name.trim()).filter(Boolean);
    if (cleanNames.length < 2) {
      return;
    }

    const newPlayers = cleanNames.slice(0, 8).map((name, index) => ({
      id: `${Date.now()}-${index}`,
      name,
      score: 0,
    }));

    setPlayers(newPlayers);
    setCurrentPlayerIndex(0);
    setTurnNumber(0);
    setPromptDeck(shuffle(QUICK_3_PROMPTS));
    setScreen('game');
  };

  const scoreTurn = (gotIt: boolean) => {
    if (!timerFinished || !currentPlayer) {
      return;
    }

    if (gotIt) {
      setPlayers((current) =>
        current.map((player, index) =>
          index === currentPlayerIndex ? { ...player, score: player.score + 1 } : player,
        ),
      );
    }

    const nextTurn = turnNumber + 1;
    if (nextTurn >= totalTurns) {
      setScreen('results');
      return;
    }

    setTurnNumber(nextTurn);
    setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length);
  };

  const playAgain = () => {
    setPlayers((current) => current.map((player) => ({ ...player, score: 0 })));
    setCurrentPlayerIndex(0);
    setTurnNumber(0);
    setPromptDeck(shuffle(QUICK_3_PROMPTS));
    setScreen('game');
  };

  const resetToHome = () => {
    setScreen('home');
    setPlayers([]);
    setNames(['', '']);
    setTurnNumber(0);
    setCurrentPlayerIndex(0);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      {screen === 'home' && (
        <View style={styles.centeredScreen}>
          <View style={styles.brandBlock}>
            <Text style={styles.logo}>RUSHIVO</Text>
            <Text style={styles.tagline}>Fast games. Good friends.</Text>
          </View>

          <View style={styles.homeButtons}>
            <PrimaryButton label="PLAY" onPress={() => setScreen('players')} />
            <SecondaryButton label="PACKS · SOON" disabled />
            <SecondaryButton label="SETTINGS · SOON" disabled />
          </View>

          <Text style={styles.madeIn}>Made in Norway 🇳🇴</Text>
        </View>
      )}

      {screen === 'players' && (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.eyebrow}>NEW GAME</Text>
            <Text style={styles.title}>Who’s playing?</Text>
            <Text style={styles.subtitle}>Add 2–8 players.</Text>

            <View style={styles.playerList}>
              {names.map((name, index) => (
                <View key={index} style={styles.playerRow}>
                  <TextInput
                    value={name}
                    onChangeText={(value) => updateName(index, value)}
                    placeholder={`Player ${index + 1}`}
                    placeholderTextColor="#7D8698"
                    maxLength={18}
                    autoCorrect={false}
                    style={styles.input}
                  />
                  {names.length > 2 && (
                    <Pressable
                      onPress={() => removePlayerField(index)}
                      style={styles.removeButton}
                      accessibilityLabel={`Remove player ${index + 1}`}
                    >
                      <Text style={styles.removeText}>×</Text>
                    </Pressable>
                  )}
                </View>
              ))}
            </View>

            {names.length < 8 && (
              <Pressable style={styles.addButton} onPress={addPlayerField}>
                <Text style={styles.addButtonText}>+ ADD PLAYER</Text>
              </Pressable>
            )}

            <View style={styles.spacer} />
            <PrimaryButton
              label="START GAME"
              onPress={startGame}
              disabled={names.map((name) => name.trim()).filter(Boolean).length < 2}
            />
            <SecondaryButton label="BACK" onPress={() => setScreen('home')} />
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {screen === 'game' && currentPlayer && (
        <View style={styles.gameScreen}>
          <View style={styles.gameTopRow}>
            <Text style={styles.roundText}>
              ROUND {Math.min(roundNumber, ROUND_COUNT)} / {ROUND_COUNT}
            </Text>
            <Text style={styles.scoreText}>SCORE {currentPlayer.score}</Text>
          </View>

          <View style={styles.turnHeader}>
            <Text style={styles.turnName}>{currentPlayer.name.toUpperCase()}’S TURN</Text>
            <Text style={styles.modeLabel}>QUICK 3</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardText}>{currentPrompt}</Text>
          </View>

          <View style={[styles.timerCircle, timerFinished && styles.timerFinished]}>
            <Text style={styles.timerNumber}>{secondsLeft}</Text>
          </View>

          {!timerFinished ? (
            <Text style={styles.timerHint}>Say three answers before time runs out!</Text>
          ) : (
            <View style={styles.answerArea}>
              <Text style={styles.timeUp}>TIME’S UP!</Text>
              <View style={styles.answerRow}>
                <Pressable style={[styles.answerButton, styles.failedButton]} onPress={() => scoreTurn(false)}>
                  <Text style={styles.answerIcon}>✕</Text>
                  <Text style={styles.answerLabel}>FAILED</Text>
                </Pressable>
                <Pressable style={[styles.answerButton, styles.gotItButton]} onPress={() => scoreTurn(true)}>
                  <Text style={styles.answerIcon}>✓</Text>
                  <Text style={styles.answerLabel}>GOT IT</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      )}

      {screen === 'results' && (
        <ScrollView contentContainerStyle={styles.resultsScreen}>
          <Text style={styles.eyebrow}>GAME OVER</Text>
          <Text style={styles.title}>Final score</Text>

          {sortedPlayers.length > 0 && (
            <View style={styles.winnerCard}>
              <Text style={styles.winnerEmoji}>🏆</Text>
              <Text style={styles.winnerLabel}>WINNER</Text>
              <Text style={styles.winnerName}>{sortedPlayers[0].name}</Text>
              <Text style={styles.winnerScore}>{sortedPlayers[0].score} points</Text>
            </View>
          )}

          <View style={styles.leaderboard}>
            {sortedPlayers.map((player, index) => (
              <View key={player.id} style={styles.leaderboardRow}>
                <Text style={styles.rank}>{index + 1}</Text>
                <Text style={styles.leaderName}>{player.name}</Text>
                <Text style={styles.leaderScore}>{player.score}</Text>
              </View>
            ))}
          </View>

          <View style={styles.spacer} />
          <PrimaryButton label="PLAY AGAIN" onPress={playAgain} />
          <SecondaryButton label="HOME" onPress={resetToHome} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function PrimaryButton({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.primaryButton,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}
    >
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

function SecondaryButton({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.secondaryButton,
        disabled && styles.secondaryDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}
    >
      <Text style={[styles.secondaryButtonText, disabled && styles.secondaryDisabledText]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B1020',
  },
  flex: {
    flex: 1,
  },
  centeredScreen: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  brandBlock: {
    alignItems: 'center',
  },
  logo: {
    color: '#FFFFFF',
    fontSize: 52,
    fontWeight: '900',
    letterSpacing: 3,
  },
  tagline: {
    color: '#B5BED2',
    fontSize: 17,
    marginTop: 8,
    fontWeight: '600',
  },
  homeButtons: {
    gap: 12,
  },
  madeIn: {
    color: '#7E899F',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 28,
  },
  eyebrow: {
    color: '#6EE7B7',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '900',
  },
  subtitle: {
    color: '#A4AEC2',
    fontSize: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  playerList: {
    gap: 10,
  },
  playerRow: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#151C2F',
    borderWidth: 1,
    borderColor: '#273149',
    borderRadius: 16,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  removeButton: {
    width: 54,
    borderRadius: 16,
    backgroundColor: '#151C2F',
    borderWidth: 1,
    borderColor: '#273149',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    color: '#FF8A8A',
    fontSize: 30,
    lineHeight: 30,
  },
  addButton: {
    marginTop: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#6EE7B7',
    fontWeight: '900',
    letterSpacing: 1,
  },
  spacer: {
    flex: 1,
    minHeight: 28,
  },
  primaryButton: {
    minHeight: 58,
    borderRadius: 18,
    backgroundColor: '#6EE7B7',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  primaryButtonText: {
    color: '#07130F',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  secondaryButton: {
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#313B52',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  secondaryButtonText: {
    color: '#D6DCE8',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1,
  },
  buttonDisabled: {
    opacity: 0.35,
  },
  secondaryDisabled: {
    opacity: 0.48,
  },
  secondaryDisabledText: {
    color: '#7B8498',
  },
  buttonPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.86,
  },
  gameScreen: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 28,
  },
  gameTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roundText: {
    color: '#8490A6',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  scoreText: {
    color: '#6EE7B7',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  turnHeader: {
    alignItems: 'center',
    marginTop: 34,
  },
  turnName: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '900',
    textAlign: 'center',
  },
  modeLabel: {
    color: '#6EE7B7',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 8,
  },
  card: {
    flex: 1,
    maxHeight: 290,
    minHeight: 220,
    marginTop: 28,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 26,
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    color: '#111827',
    fontSize: 27,
    lineHeight: 36,
    fontWeight: '900',
    textAlign: 'center',
  },
  timerCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 7,
    borderColor: '#6EE7B7',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 26,
  },
  timerFinished: {
    borderColor: '#FF7A7A',
  },
  timerNumber: {
    color: '#FFFFFF',
    fontSize: 44,
    lineHeight: 50,
    fontWeight: '900',
  },
  timerHint: {
    color: '#9BA6BA',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 18,
    fontWeight: '600',
  },
  answerArea: {
    marginTop: 16,
  },
  timeUp: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '900',
    letterSpacing: 1.4,
    marginBottom: 12,
  },
  answerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  answerButton: {
    flex: 1,
    minHeight: 74,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  failedButton: {
    backgroundColor: '#A83F4A',
  },
  gotItButton: {
    backgroundColor: '#168A65',
  },
  answerIcon: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '900',
  },
  answerLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
  resultsScreen: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 28,
  },
  winnerCard: {
    backgroundColor: '#151C2F',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#2C3853',
    alignItems: 'center',
    paddingVertical: 24,
    marginTop: 26,
  },
  winnerEmoji: {
    fontSize: 34,
  },
  winnerLabel: {
    color: '#6EE7B7',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 8,
  },
  winnerName: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '900',
    marginTop: 4,
  },
  winnerScore: {
    color: '#AAB4C6',
    fontSize: 15,
    marginTop: 4,
    fontWeight: '700',
  },
  leaderboard: {
    marginTop: 18,
    gap: 8,
  },
  leaderboardRow: {
    minHeight: 58,
    borderRadius: 16,
    backgroundColor: '#131A2C',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rank: {
    width: 36,
    color: '#7E899F',
    fontSize: 16,
    fontWeight: '900',
  },
  leaderName: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  leaderScore: {
    color: '#6EE7B7',
    fontSize: 18,
    fontWeight: '900',
  },
});
