import { Login } from '@/api/login';
import { OTPValidation } from '@/api/OtpValidation';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Dimensions, Image, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { OtpInput } from 'react-native-otp-entry';

const logo = require('../assets/images/logo.png');
const { height, width } = Dimensions.get('screen');


export default function Index() {
    const [screenLoading, setScreenLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [loginSpinner, setLoginSpinner] = useState(false);
    const [sessionId, setSessionId] = useState('');
    const [otpSpinner, setOtpSpinner] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [isActive, setIsActive] = useState(false)
    const [timeLeft, setTimeLeft] = useState(120);
    const [overlay, setOverlay] = useState(false);
    const translateY = useRef(new Animated.Value(height)).current;
    const fadeInAnim = useRef(new Animated.Value(0)).current;
    const router = useRouter();

    useEffect(() => {
        const checkToken = async function getToken() {
            const token = await AsyncStorage.getItem('device_token');

            setTimeout(() => {
                if(token) {
                    router.push('/dashboard')
                }
                setScreenLoading(false);
            }, 600)
        }

        checkToken();
    }, [])

    useEffect(() => {
        let timer: ReturnType<typeof setInterval>

        if(isActive) {
            if(timeLeft > 0) {
                timer = setInterval(() => {
                    setTimeLeft((prev) => prev - 1  )
                }, 1000);
            }else if(timeLeft == 0) {
                setIsActive(false);
            }
        }

        return () => clearInterval(timer);
    }, [isActive, timeLeft])

    const resetTimer = () => {
        setTimeLeft(120);
        setIsActive(true);
    }

    const toggleSheet = () => {
        setOverlay(true);
        
        fadeIn()
        setIsActive(true);
        Animated.timing(translateY, {
        toValue: 0,
        useNativeDriver: true,
        }).start();
    }

    const fadeIn = () => {
        Animated.timing(fadeInAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        }).start();
    }

    const closeSheet = () => {
        fadeClose();
        setOverlay(false);
        
        Animated.timing(translateY, {
        toValue: height,
        useNativeDriver: true,
        }).start();
    }

    const fadeClose = () => {
        Animated.timing(fadeInAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        }).start();
    }

    const handleLogin = async () => {
        if(!email.trim() || !password.trim()) {
            Alert.alert('Invalid', 'Email and password are required.');
            
            return;
        }

        setLoginSpinner(true);

        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let randString = '';

        for (let i = 0; i < 5; i++) {
            randString += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        try {
            console.log(email.trim(), password.trim(), randString)
            const response = await Login(email.trim(), password.trim(), randString);

            if(!response.error) {
                toggleSheet();
                setSessionId(response.session_id);
                await AsyncStorage.setItem('session_id', response.session_id);
            }else {
                Alert.alert('Invalid', 'Invalid credentials. Please try again.');
            }

        }catch(error: any) {
            Alert.alert('Error', error.message)
        }finally {
            setLoginSpinner(false)
        }
    }

    const handleOTPValidation = async () => {
        if(!otpCode.trim()) {
            Alert. alert('Invalid', 'OTP code is required.');
            return;
        }

        setOtpSpinner(true);
        try {
            const response = await OTPValidation(Number(otpCode), sessionId);
            
            if(!response.error) {
                await AsyncStorage.setItem('device_token', response.device_token);
                await AsyncStorage.setItem('access_token', response.access_token);

                router.replace('/(tabs)/dashboard')
            }
        }catch(error: any) {
            Alert.alert('Error', error.message);
        }finally {
            setOtpSpinner(false)
        }
    }

    const handleResendOtp = () => {
        resetTimer();
        handleLogin();
    }

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} >
            {screenLoading == true ? (
                <View style={{ justifyContent: 'center', height }}>
                    <ActivityIndicator color={'#3498db'} size={'large'} />
                </View>
            ) : (
                <>
                    <LinearGradient
                        colors={['#4FB3E3', '#52B8E6', '#7DD4F7', '#B8E6A5', '#E8D97B', '#F4CD5D']}
                        start={{ x: 0.5, y: 0 }}
                        end={{ x: 0.5, y: 1 }}
                        style={{ height, position: 'absolute', width, top: 0, zIndex: 1 }}
                    />
                    <ScrollView style={{ flex: 1, zIndex: 10, }}>
                        <View style={{paddingTop: 120, alignItems: 'center', paddingHorizontal: 30 }}>
                            <View style={styles.logoContainer}>
                                <View>
                                    <Image source={logo} style={{ height: 60, width: 60 }} resizeMode="contain" />
                                </View>
                            </View>

                            <View style={{ alignItems: 'center', marginTop: 10, marginBottom: 10 }}>
                                <Text style={styles.collegeText}>MLG COLLEGE OF LEARNING, INC.</Text>
                                <Text style={styles.locationText}>BRGY. ATABAY, HILONGOS, LEYTE</Text>
                            </View>

                            <View style={{ flexDirection: 'column', alignItems: 'center', width: '100%', marginTop: 20 }}>
                                <Text style={styles.titleText}>MLGCL LIBRARY</Text>
                                
                                <View style={{ width: '100%', marginTop: 40 }}>
                                    <Text style={styles.label}>Email</Text>
                                    <TextInput
                                        placeholder="Enter your email"
                                        placeholderTextColor="#A8CBDB"
                                        value={email}
                                        onChangeText={(text) => setEmail(text)}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        onFocus={() => setEmailFocused(true)}
                                        onBlur={() => setEmailFocused(false)}
                                        style={[styles.input, emailFocused && styles.inputFocused]}
                                    />
                                </View>
                                <View style={{ width: '100%' }}>
                                    <Text style={styles.label}>Password</Text>
                                    <View style={[styles.passwordInput, passwordFocused && styles.inputFocused]}>
                                        <TextInput
                                            placeholder="Enter your password"
                                            placeholderTextColor="#A8CBDB"
                                            value={password}
                                            onChangeText={(text) => setPassword(text)}
                                            autoCapitalize="none"
                                            secureTextEntry={!isPasswordVisible}
                                            onFocus={() => setPasswordFocused(true)}
                                            onBlur={() => setPasswordFocused(false)}
                                            style={{ flex: 1, color: '#2C5F7B', fontSize: 15 }}
                                        />
                                        <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={{ paddingHorizontal: 15 }}>
                                            {isPasswordVisible == true ? (
                                                <Ionicons name="lock-open" color={'#7DB8D1'} size={22} />
                                            ) : (
                                                <Ionicons name="lock-closed" color={'#7DB8D1'} size={22} />
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                
                                <TouchableOpacity 
                                    disabled={loginSpinner} 
                                    onPress={() => handleLogin()} 
                                    style={[styles.button, {backgroundColor: loginSpinner == true ? '#F5C557' : '#F5B840'}]} 
                                >
                                    {loginSpinner == true ? (
                                        <ActivityIndicator size={'small'} color={'#fff'} style={{ alignSelf: 'center' }} />
                                    ) : (
                                        <Text style={styles.buttonText}>LOGIN</Text>
                                    )}
                                </TouchableOpacity>
                            </View>

                            <Animated.View style={{ flexDirection: 'column', alignItems: 'center',justifyContent: 'space-between', position: 'absolute', bottom: -140, width: width - 30, height: 400, transform: [{ translateY: translateY }], backgroundColor: '#FAFAFA', borderRadius: 30, zIndex: 5, paddingHorizontal: 25, paddingVertical: 35 }}>
                                <View>
                                    <Text style={{ fontSize: 24, fontWeight: '900' }}>Enter 6 Digits Code</Text>
                                    <Text style={{ fontSize: 13, marginTop: 20, color: '#545454' }}>Please enter verification code sent to your registered mlgcl email.</Text>
                                    <View style={{ marginTop: 20 }}>
                                        <OtpInput numberOfDigits={6} focusColor={'#3498db'} autoFocus={false} onTextChange={(text) => {
                                            setOtpCode(text);
                                            if(text.length == 6) {
                                                Keyboard.dismiss();
                                            }
                                        }} />
                                    </View>
                                    <View style={{ flexDirection: 'row', alignSelf: 'center', marginTop: 20 }}>
                                        <Text style={{ fontSize: 12, color: '#545454' }}>Didn't receive a code? </Text>
                                        <TouchableOpacity onPress={() => handleResendOtp()}  disabled={isActive} >
                                            <Text style={{ fontSize: 12, fontWeight: '700', color: isActive == true ? '#78bdebff' : '#3498db' }}>Resend code</Text>
                                        </TouchableOpacity>
                                        {isActive && (
                                        <>
                                            <Text>{` (${timeLeft})`}</Text>
                                        </>
                                        )}
                                    </View>
                                </View>
                                <View style={{ position: 'relative', width: '100%', alignItems: 'center', gap: 15 }}>
                                    <TouchableOpacity onPress={() => handleOTPValidation()} disabled={otpSpinner} style={{ backgroundColor: otpSpinner == true ? '#5faee2ff' : '#3498db', width: '100%',
                                        borderRadius: 10, paddingVertical: 14 }}>
                                        {otpSpinner == true ? (
                                            <ActivityIndicator size={'small'} color={'#fff'} style={{ alignSelf: 'center' }} />
                                        ) : (
                                            <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center', fontSize: 16 }}>Verify</Text>
                                        )}
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => closeSheet()} >
                                        <Text style={{ fontWeight: 'bold', textAlign: 'center', color: '#838383', fontSize: 16 }}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            </Animated.View>
                        </View>
                    </ScrollView>
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>@CreativeDevLabs</Text>
                    </View>
                </>
            )}
        </KeyboardAvoidingView>
    )
}


const styles = StyleSheet.create({
    container: {
        padding: 20,
        height: height,
        width: width,
        paddingTop: 100,
        gap: 50
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    collegeText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 1.5,
        textAlign: 'center',
    },
    locationText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '400',
        letterSpacing: 1,
        marginTop: 4,
        textAlign: 'center',
    },
    titleText: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: 'bold',
        letterSpacing: 1,
        textAlign: 'center',
    },
    label: {
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginBottom: 5,
        borderWidth: 0,
        color: '#2C5F7B',
        fontSize: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    passwordInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingVertical: 8,
        paddingLeft: 20,
        borderRadius: 10,
        marginBottom: 15,
        borderWidth: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    button: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 6,
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 1.5,
    },
    inputFocused: {
        borderColor: '#F5B840', 
        borderWidth: 2,
    },
    footer: {
        position: 'absolute',
        left: '50%',
        transform: [{ translateX: '-50%' }],
        bottom: 40,
        alignItems: 'center',
        zIndex: 10
    },
    footerText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '500',
        letterSpacing: 1,
        opacity: 0.8,
    },
});