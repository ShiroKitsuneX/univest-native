import { useRef, useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  Animated,
  LayoutAnimation,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/theme/useTheme'
import {
  validatePassword,
  validateBirthdate,
  validateEmail,
} from '@/utils/validation'
import {
  signIn,
  signUp,
  resetPassword,
  getAuthErrorMessage,
} from '@/services/auth'
import { useIcons } from '@/stores/hooks/useIcons'
import {
  checkTermsStatus,
  DEFAULT_TERMS_CONTENT,
  type TermsStatus,
} from '@/features/auth/services/termsService'

const INITIAL_TOUCHED = {
  email: false,
  nome: false,
  sobrenome: false,
  senha: false,
  confirmarSenha: false,
  nascimento: false,
}

export function WelcomeScreen() {
  const insets = useSafeAreaInsets()
  const { T, isDark, AT } = useTheme()
  const getIcon = useIcons()

  const [showLogin, setShowLogin] = useState(false)
  const [loginMode, setLoginMode] = useState('login')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authConfirmPassword, setAuthConfirmPassword] = useState('')
  const [authBirthdate, setAuthBirthdate] = useState('')
  const [authAcceptTerms, setAuthAcceptTerms] = useState(false)
  const [authName, setAuthName] = useState('')
  const [authSobrenome, setAuthSobrenome] = useState('')
  const [authError, setAuthError] = useState('')
  const [authSubmitting, setAuthSubmitting] = useState(false)
  const [forgotMode, setForgotMode] = useState(false)
  const [passwordSent, setPasswordSent] = useState(false)
  const [showLoginPwd, setShowLoginPwd] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [authTouched, setAuthTouched] = useState(INITIAL_TOUCHED)
  const [termsStatus, setTermsStatus] = useState<TermsStatus>({
    terms: null,
    userAcceptance: null,
    needsReaccept: false,
  })

  useEffect(() => {
    checkTermsStatus(null).then(setTermsStatus)
  }, [])

  const loginBtnScale = useRef(new Animated.Value(1)).current

  const handleLogin = async () => {
    if (!authEmail || !authPassword) {
      setAuthError('Preencha e-mail e senha')
      return
    }
    setAuthSubmitting(true)
    setAuthError('')
    try {
      await signIn(authEmail, authPassword)
      setShowLogin(false)
      setAuthEmail('')
      setAuthPassword('')
    } catch (err) {
      setAuthError(getAuthErrorMessage(err, 'login'))
    }
    setAuthSubmitting(false)
  }

  const handleSignup = async () => {
    setAuthTouched({
      email: true,
      nome: true,
      sobrenome: true,
      senha: true,
      confirmarSenha: true,
      nascimento: true,
    })
    const emailErr = validateEmail(authEmail)
    const pwdErr = validatePassword(authPassword)
    const dobErr = validateBirthdate(authBirthdate)
    if (emailErr) {
      setAuthError(emailErr)
      return
    }
    if (dobErr) {
      setAuthError(dobErr)
      return
    }
    if (
      !authPassword ||
      !authName.trim() ||
      !authSobrenome.trim() ||
      pwdErr ||
      authPassword !== authConfirmPassword ||
      !authAcceptTerms
    )
      return
    setAuthSubmitting(true)
    setAuthError('')
    try {
      await signUp({
        email: authEmail,
        password: authPassword,
        nome: authName,
        sobrenome: authSobrenome,
        dataNascimento: authBirthdate,
      })
      setAuthEmail('')
      setAuthPassword('')
      setAuthName('')
      setAuthSobrenome('')
      setAuthConfirmPassword('')
      setAuthBirthdate('')
      setAuthAcceptTerms(false)
      setAuthTouched(INITIAL_TOUCHED)
    } catch (err) {
      setAuthError(getAuthErrorMessage(err, 'signup'))
    }
    setAuthSubmitting(false)
  }

  const handleForgotPassword = async () => {
    if (!authEmail) {
      setAuthError('Preencha seu e-mail')
      return
    }
    setAuthSubmitting(true)
    setAuthError('')
    try {
      await resetPassword(authEmail)
      setPasswordSent(true)
    } catch (err) {
      setAuthError(
        err.code === 'auth/user-not-found'
          ? 'E-mail não cadastrado'
          : 'Erro ao enviar e-mail.'
      )
    }
    setAuthSubmitting(false)
  }

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          padding: 28,
          paddingTop: insets.top + 28,
          paddingBottom: insets.bottom + 28,
        }}
      >
        <Text style={{ fontSize: 64, textAlign: 'center', marginBottom: 14 }}>
          🎓
        </Text>
        <Text
          style={{
            fontSize: 34,
            fontWeight: '800',
            color: T.text,
            textAlign: 'center',
            marginBottom: 8,
          }}
        >
          Uni<Text style={{ color: T.accent }}>Vest</Text>
        </Text>
        <Text
          style={{
            color: T.sub,
            fontSize: 14,
            textAlign: 'center',
            lineHeight: 24,
            marginBottom: 32,
          }}
        >
          Seu portal inteligente para toda a jornada acadêmica
        </Text>
        <View style={{ gap: 10, marginBottom: 32 }}>
          {[
            ['vestibular', '🎯', 'Vestibulares & ENEM', '#e11d48'],
            ['graduacao', '🎓', 'Graduação & Pós-graduação', '#7c3aed'],
            ['mestrado', '🔬', 'Mestrado & Doutorado', '#2563eb'],
            ['tecnico', '📚', 'Ensino Médio & Técnico', '#059669'],
            ['cursos', '📖', 'Cursos e outros', '#f59e0b'],
          ].map(([id, ic, l, cor]) => (
            <View
              key={id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: T.card,
                borderRadius: 16,
                padding: 14,
                borderWidth: 1,
                borderColor: T.border,
                gap: 14,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: cor + '22',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 22 }}>{getIcon(id, ic)}</Text>
              </View>
              <Text
                style={{
                  color: T.text,
                  fontSize: 14,
                  fontWeight: '600',
                  flex: 1,
                }}
              >
                {l}
              </Text>
            </View>
          ))}
        </View>
        <TouchableOpacity
          onPress={() => {
            Animated.spring(loginBtnScale, {
              toValue: 0.9,
              useNativeDriver: true,
            }).start()
            setTimeout(() => {
              Animated.spring(loginBtnScale, {
                toValue: 1,
                useNativeDriver: true,
              }).start()
              setLoginMode('login')
              setShowLogin(true)
              setAuthTouched(INITIAL_TOUCHED)
            }, 100)
          }}
          activeOpacity={0.9}
        >
          <Animated.View
            style={{
              padding: 16,
              borderRadius: 18,
              backgroundColor: T.accent,
              alignItems: 'center',
              transform: [{ scale: loginBtnScale }],
              shadowColor: T.accent,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
            }}
          >
            <Text style={{ color: AT, fontSize: 16, fontWeight: '800' }}>
              Entrar ou criar conta
            </Text>
          </Animated.View>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={showLogin}
        transparent
        animationType="slide"
        // @ts-ignore - animationDuration is valid but missing from types
        animationDuration={200}
        onRequestClose={() => setShowLogin(false)}
      >
        <View style={{ flex: 1, backgroundColor: T.bg }}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                padding: 20,
                paddingTop: insets.top + 20,
                paddingBottom: insets.bottom + 20,
              }}
            >
              <View
                style={{
                  backgroundColor: T.card,
                  borderRadius: 20,
                  padding: 24,
                  width: '100%',
                  maxWidth: 360,
                  alignSelf: 'center',
                }}
              >
                <Text
                  style={{ fontSize: 44, textAlign: 'center', marginBottom: 8 }}
                >
                  🎓
                </Text>
                <Text
                  style={{
                    color: T.text,
                    fontSize: 22,
                    fontWeight: '800',
                    textAlign: 'center',
                    marginBottom: 20,
                  }}
                >
                  UniVest
                </Text>
                {!forgotMode && !passwordSent && (
                  <>
                    <View
                      style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}
                    >
                      {[
                        ['login', 'Entrar'],
                        ['signup', 'Criar conta'],
                      ].map(([m, l]) => {
                        const isSelected = loginMode === m
                        return (
                          <TouchableOpacity
                            key={m}
                            onPress={() => {
                              LayoutAnimation.configureNext(
                                LayoutAnimation.Presets.easeInEaseOut
                              )
                              setLoginMode(m)
                              setAuthTouched(INITIAL_TOUCHED)
                            }}
                            activeOpacity={0.85}
                            style={{
                              flex: 1,
                              padding: 10,
                              borderRadius: 12,
                              backgroundColor: isSelected ? T.accent : T.card2,
                              alignItems: 'center',
                            }}
                          >
                            <Text
                              style={{
                                color: isSelected ? AT : T.sub,
                                fontWeight: '700',
                                fontSize: 13,
                              }}
                            >
                              {l}
                            </Text>
                          </TouchableOpacity>
                        )
                      })}
                    </View>
                    <Text
                      style={{ color: T.sub, fontSize: 12, marginBottom: 6 }}
                    >
                      E-mail
                    </Text>
                    <TextInput
                      value={authEmail}
                      onChangeText={t => {
                        setAuthEmail(t)
                        setAuthTouched(p => ({ ...p, email: true }))
                      }}
                      placeholder="seu@email.com"
                      placeholderTextColor={T.muted}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      style={{
                        padding: 12,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor:
                          authTouched.email && !authEmail
                            ? '#f87171'
                            : T.border,
                        backgroundColor: T.inp,
                        color: T.text,
                        fontSize: 14,
                        marginBottom: 16,
                      }}
                    />
                    {loginMode === 'signup' && (
                      <Animated.View
                        style={{ overflow: 'hidden', marginBottom: 16 }}
                      >
                        <Text
                          style={{
                            color: T.sub,
                            fontSize: 12,
                            marginBottom: 6,
                          }}
                        >
                          Nome
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                          <TextInput
                            value={authName}
                            onChangeText={t => {
                              setAuthName(t)
                              setAuthTouched(p => ({ ...p, nome: true }))
                            }}
                            placeholder="Nome"
                            placeholderTextColor={T.muted}
                            autoCapitalize="words"
                            style={{
                              flex: 1,
                              padding: 12,
                              borderRadius: 12,
                              borderWidth: 1,
                              borderColor:
                                authTouched.nome && !authName.trim()
                                  ? '#f87171'
                                  : T.border,
                              backgroundColor: T.inp,
                              color: T.text,
                              fontSize: 14,
                            }}
                          />
                          <TextInput
                            value={authSobrenome}
                            onChangeText={t => {
                              setAuthSobrenome(t)
                              setAuthTouched(p => ({ ...p, sobrenome: true }))
                            }}
                            placeholder="Sobrenome"
                            placeholderTextColor={T.muted}
                            autoCapitalize="words"
                            style={{
                              flex: 1,
                              padding: 12,
                              borderRadius: 12,
                              borderWidth: 1,
                              borderColor:
                                authTouched.sobrenome && !authSobrenome.trim()
                                  ? '#f87171'
                                  : T.border,
                              backgroundColor: T.inp,
                              color: T.text,
                              fontSize: 14,
                            }}
                          />
                        </View>
                      </Animated.View>
                    )}
                    <Text
                      style={{ color: T.sub, fontSize: 12, marginBottom: 6 }}
                    >
                      Senha
                    </Text>
                    <View style={{ marginBottom: 4 }}>
                      <TextInput
                        value={authPassword}
                        onChangeText={t => {
                          setAuthPassword(t)
                          setAuthTouched(p => ({ ...p, senha: true }))
                        }}
                        placeholder={
                          loginMode === 'signup'
                            ? 'Mínimo 8 caracteres'
                            : '••••••••'
                        }
                        placeholderTextColor={T.muted}
                        secureTextEntry={!showLoginPwd}
                        maxLength={64}
                        style={{
                          padding: 12,
                          paddingRight: 44,
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor:
                            loginMode === 'signup' &&
                            authTouched.senha &&
                            validatePassword(authPassword)
                              ? '#f87171'
                              : T.border,
                          backgroundColor: T.inp,
                          color: T.text,
                          fontSize: 14,
                        }}
                      />
                      <TouchableOpacity
                        onPress={() => setShowLoginPwd(!showLoginPwd)}
                        style={{ position: 'absolute', right: 12, top: 12 }}
                      >
                        <Text style={{ fontSize: 16 }}>
                          {showLoginPwd ? '👁️‍🗨️' : '👁️'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    {loginMode === 'signup' && (
                      <View
                        style={{
                          backgroundColor: T.inp,
                          borderWidth: 1,
                          borderColor: T.border,
                          borderRadius: 12,
                          padding: 12,
                          marginBottom: 12,
                        }}
                      >
                        <Text
                          style={{
                            color: T.sub,
                            fontSize: 11,
                            fontWeight: '600',
                            marginBottom: 6,
                          }}
                        >
                          Sua senha precisa ter:
                        </Text>
                        {[
                          ['8+ caracteres', /.{8,}/] as [string, RegExp],
                          ['Maiúscula', /[A-Z]/] as [string, RegExp],
                          ['Minúscula', /[a-z]/] as [string, RegExp],
                          ['Número', /\d/] as [string, RegExp],
                        ].map(([req, regex]) => {
                          const met = regex.test(authPassword)
                          return (
                            <View
                              key={req}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginBottom: 4,
                              }}
                            >
                              <Text style={{ fontSize: 10, marginRight: 6 }}>
                                {met ? '✓' : '○'}
                              </Text>
                              <Text
                                style={{
                                  color: met ? T.accent : T.muted,
                                  fontSize: 11,
                                }}
                              >
                                {req}
                              </Text>
                            </View>
                          )
                        })}
                      </View>
                    )}
                    {loginMode === 'signup' && (
                      <>
                        <Text
                          style={{
                            color: T.sub,
                            fontSize: 12,
                            marginBottom: 6,
                          }}
                        >
                          Confirmar Senha
                        </Text>
                        <View style={{ marginBottom: 8 }}>
                          <TextInput
                            value={authConfirmPassword}
                            onChangeText={t => {
                              setAuthConfirmPassword(t)
                              setAuthTouched(p => ({
                                ...p,
                                confirmarSenha: true,
                              }))
                            }}
                            placeholder="••••••••"
                            placeholderTextColor={T.muted}
                            secureTextEntry={!showLoginPwd}
                            maxLength={64}
                            style={{
                              padding: 12,
                              paddingRight: 44,
                              borderRadius: 12,
                              borderWidth: 1,
                              borderColor:
                                authTouched.confirmarSenha &&
                                (authConfirmPassword !== authPassword ||
                                  validatePassword(authPassword))
                                  ? '#f87171'
                                  : T.border,
                              backgroundColor: T.inp,
                              color: T.text,
                              fontSize: 14,
                            }}
                          />
                          <TouchableOpacity
                            onPress={() => setShowLoginPwd(!showLoginPwd)}
                            style={{ position: 'absolute', right: 12, top: 12 }}
                          >
                            <Text style={{ fontSize: 16 }}>
                              {showLoginPwd ? '👁️‍🗨️' : '👁️'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                        {loginMode === 'signup' &&
                          authTouched.confirmarSenha &&
                          authConfirmPassword !== authPassword && (
                            <Text
                              style={{
                                color: '#f87171',
                                fontSize: 11,
                                marginBottom: 12,
                              }}
                            >
                              As senhas não coincidem
                            </Text>
                          )}
                        <Text
                          style={{
                            color: T.sub,
                            fontSize: 12,
                            marginBottom: 6,
                          }}
                        >
                          Data de Nascimento
                        </Text>
                        <TextInput
                          value={authBirthdate}
                          onChangeText={text => {
                            let t = text.replace(/\D/g, '').slice(0, 10)
                            if (t.length > 4) {
                              if (t.length > 4 && t.length <= 6)
                                t =
                                  t.slice(0, 2) +
                                  '/' +
                                  t.slice(2, 4) +
                                  '/' +
                                  t.slice(4)
                              else if (t.length > 6)
                                t =
                                  t.slice(0, 2) +
                                  '/' +
                                  t.slice(2, 4) +
                                  '/' +
                                  t.slice(4, 8)
                            } else if (t.length > 2)
                              t = t.slice(0, 2) + '/' + t.slice(2)
                            setAuthBirthdate(t)
                            const d = parseInt(t.slice(0, 2)) || 0,
                              m = parseInt(t.slice(3, 5)) || 0,
                              y = parseInt(t.slice(6, 10)) || 0
                            const invalid =
                              !t ||
                              d < 1 ||
                              d > 31 ||
                              m < 1 ||
                              m > 12 ||
                              y < 1900 ||
                              y > 2100
                            setAuthTouched(p => ({ ...p, nascimento: invalid }))
                          }}
                          placeholder="DD/MM/AAAA"
                          placeholderTextColor={T.muted}
                          keyboardType="numeric"
                          style={{
                            padding: 12,
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: authTouched.nascimento
                              ? '#f87171'
                              : T.border,
                            backgroundColor: T.inp,
                            color: T.text,
                            fontSize: 14,
                            marginBottom: 16,
                          }}
                        />
                        {authTouched.nascimento && (
                          <Text
                            style={{
                              color: '#f87171',
                              fontSize: 11,
                              marginBottom: 16,
                            }}
                          >
                            Data inválida (DD/MM/AAAA)
                          </Text>
                        )}
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'flex-start',
                            marginTop: 16,
                            paddingTop: 16,
                            borderTopWidth: 1,
                            borderTopColor: T.border,
                          }}
                        >
                          <TouchableOpacity
                            onPress={() => setAuthAcceptTerms(!authAcceptTerms)}
                            style={{
                              marginRight: 10,
                              marginTop: 2,
                            }}
                          >
                            <View
                              style={{
                                width: 22,
                                height: 22,
                                borderRadius: 6,
                                backgroundColor: authAcceptTerms
                                  ? T.accent
                                  : T.inp,
                                borderWidth: 1,
                                borderColor: authAcceptTerms
                                  ? T.accent
                                  : T.border,
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {authAcceptTerms && (
                                <Text
                                  style={{
                                    color: AT,
                                    fontSize: 14,
                                    fontWeight: '700',
                                  }}
                                >
                                  ✓
                                </Text>
                              )}
                            </View>
                          </TouchableOpacity>
                          <Text style={{ color: T.sub, fontSize: 12, flex: 1 }}>
                            Li e aceito os{' '}
                          </Text>
                          <TouchableOpacity
                            onPress={() => {
                              setShowLogin(false)
                              setTimeout(() => setShowTerms(true), 300)
                            }}
                            activeOpacity={0.7}
                          >
                            <Text
                              style={{
                                color: T.accent,
                                fontSize: 12,
                                textDecorationLine: 'underline',
                              }}
                            >
                              Termos e Condições
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    )}
                    {!!authError && (
                      <Text
                        style={{
                          color: '#f87171',
                          fontSize: 12,
                          marginBottom: 8,
                          textAlign: 'center',
                        }}
                      >
                        {authError}
                      </Text>
                    )}
                    <TouchableOpacity
                      onPress={
                        loginMode === 'login' ? handleLogin : handleSignup
                      }
                      disabled={authSubmitting}
                      style={{
                        padding: 14,
                        borderRadius: 14,
                        backgroundColor: T.accent,
                        alignItems: 'center',
                        marginTop: 8,
                      }}
                    >
                      <Text
                        style={{ color: AT, fontSize: 15, fontWeight: '800' }}
                      >
                        {authSubmitting
                          ? 'Aguarde...'
                          : loginMode === 'login'
                            ? 'Entrar'
                            : 'Criar conta'}
                      </Text>
                    </TouchableOpacity>
                    {loginMode === 'login' && (
                      <TouchableOpacity
                        onPress={() => {
                          setForgotMode(true)
                          setAuthError('')
                        }}
                        style={{
                          padding: 10,
                          alignItems: 'center',
                          marginTop: 8,
                        }}
                      >
                        <Text
                          style={{
                            color: T.accent,
                            fontSize: 13,
                            fontWeight: '600',
                          }}
                        >
                          Esqueceu a senha?
                        </Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
                {forgotMode && !passwordSent && (
                  <>
                    <TouchableOpacity
                      onPress={() => {
                        setForgotMode(false)
                        setAuthError('')
                      }}
                      style={{ marginBottom: 16 }}
                    >
                      <Text style={{ color: T.sub, fontSize: 13 }}>
                        ← Voltar
                      </Text>
                    </TouchableOpacity>
                    <Text
                      style={{
                        color: T.text,
                        fontSize: 18,
                        fontWeight: '800',
                        textAlign: 'center',
                        marginBottom: 4,
                      }}
                    >
                      Esqueceu a senha?
                    </Text>
                    <Text
                      style={{
                        color: T.sub,
                        fontSize: 13,
                        textAlign: 'center',
                        marginBottom: 16,
                      }}
                    >
                      Enviaremos um link para redefinir
                    </Text>
                    <TextInput
                      value={authEmail}
                      onChangeText={setAuthEmail}
                      placeholder="seu@email.com"
                      placeholderTextColor={T.muted}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      style={{
                        padding: 12,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: T.border,
                        backgroundColor: T.inp,
                        color: T.text,
                        fontSize: 14,
                        marginBottom: 8,
                      }}
                    />
                    {!!authError && (
                      <Text
                        style={{
                          color: '#f87171',
                          fontSize: 12,
                          marginBottom: 8,
                          textAlign: 'center',
                        }}
                      >
                        {authError}
                      </Text>
                    )}
                    <TouchableOpacity
                      onPress={handleForgotPassword}
                      disabled={authSubmitting}
                      style={{
                        padding: 14,
                        borderRadius: 14,
                        backgroundColor: T.accent,
                        alignItems: 'center',
                        marginTop: 8,
                      }}
                    >
                      <Text
                        style={{ color: AT, fontSize: 15, fontWeight: '800' }}
                      >
                        {authSubmitting ? 'Enviando...' : 'Enviar link'}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
                {passwordSent && (
                  <>
                    <Text
                      style={{
                        fontSize: 48,
                        textAlign: 'center',
                        marginBottom: 12,
                      }}
                    >
                      📧
                    </Text>
                    <Text
                      style={{
                        color: T.text,
                        fontSize: 18,
                        fontWeight: '800',
                        textAlign: 'center',
                        marginBottom: 8,
                      }}
                    >
                      E-mail enviado!
                    </Text>
                    <Text
                      style={{
                        color: T.sub,
                        fontSize: 13,
                        textAlign: 'center',
                        lineHeight: 20,
                        marginBottom: 16,
                      }}
                    >
                      Verifique sua caixa de entrada.
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setPasswordSent(false)
                        setForgotMode(false)
                        setLoginMode('login')
                      }}
                      style={{
                        padding: 14,
                        borderRadius: 14,
                        backgroundColor: T.accent,
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={{ color: AT, fontSize: 15, fontWeight: '800' }}
                      >
                        Entendi
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
                <TouchableOpacity
                  onPress={() => {
                    setShowLogin(false)
                    setLoginMode('login')
                    setForgotMode(false)
                    setPasswordSent(false)
                    setAuthError('')
                    setAuthConfirmPassword('')
                    setAuthBirthdate('')
                    setAuthAcceptTerms(false)
                    setAuthTouched(INITIAL_TOUCHED)
                  }}
                  style={{ padding: 10, alignItems: 'center', marginTop: 12 }}
                >
                  <Text style={{ color: T.muted, fontSize: 13 }}>Fechar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Modal
        visible={showTerms}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTerms(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: T.bg,
          }}
        >
          <View
            style={{
              padding: 20,
              paddingTop: insets.top + 20,
              paddingBottom: insets.bottom + 20,
              flex: 1,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  setShowTerms(false)
                  setShowLogin(true)
                }}
                style={{ padding: 8 }}
              >
                <Text style={{ color: T.sub, fontSize: 24 }}>←</Text>
              </TouchableOpacity>
              <Text
                style={{
                  color: T.text,
                  fontSize: 20,
                  fontWeight: '800',
                  flex: 1,
                  textAlign: 'center',
                  marginRight: 40,
                }}
              >
                Termos e Condições
              </Text>
            </View>
            <ScrollView style={{ flex: 1, marginBottom: 20 }}>
              <Text style={{ color: T.sub, fontSize: 13, lineHeight: 22 }}>
                {termsStatus.terms?.content || DEFAULT_TERMS_CONTENT}
                {'\n\n'}
                {termsStatus.terms && (
                  <Text style={{ fontStyle: 'italic', fontSize: 11 }}>
                    Versão {termsStatus.terms.version} - Atualizado em{' '}
                    {new Date(termsStatus.terms.createdAt).toLocaleDateString(
                      'pt-BR'
                    )}
                  </Text>
                )}
              </Text>
            </ScrollView>
            <View style={{ gap: 12 }}>
              <TouchableOpacity
                onPress={() => {
                  setShowTerms(false)
                  setAuthAcceptTerms(true)
                  setShowLogin(true)
                }}
                style={{
                  padding: 16,
                  borderRadius: 16,
                  backgroundColor: T.accent,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: AT, fontSize: 16, fontWeight: '800' }}>
                  Aceitar e continuar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowTerms(false)
                  setShowLogin(true)
                }}
                style={{ padding: 14, alignItems: 'center' }}
              >
                <Text style={{ color: T.sub, fontSize: 14 }}>Voltar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}
