import { Login } from '@/api/login';
import { OTPValidation } from '@/api/OtpValidation';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Dimensions, Image, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { OtpInput } from 'react-native-otp-entry';

const logo = require('../assets/images/logo-name.png');
const school = require('../assets/images/school.png');
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
                console.log(response.access_token)

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
        <View style={{ flex: 1, paddingHorizontal: 20 }}>
            {screenLoading == true ? (
                <View style={{ justifyContent: 'center', height }}>
                    <ActivityIndicator color={'#3498db'} size={'large'} />
                </View>
            ) : (
                <>
                    <Image source={school} resizeMode='cover' style={{ position: 'absolute', width, height, zIndex: -1, opacity: 0.7 }} />
                    <LinearGradient
                        colors={['#3498db', 'rgba(52, 152, 219, 0.88)',  'rgba(52, 152, 219, 0.75)', 'rgba(241, 196, 15, 0.57)',]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ height, position: 'absolute', width, top: 0, zIndex: 2 }}
                    />
                    <View style={{paddingTop: 170, alignItems: 'center', height, gap: 40, zIndex: 10 }}>
                        <Image source={logo} style={{ height: 80, width: 200 }} />

                        <View style={{ flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 2 }}>MLGCL LIBRARY</Text>
                            <View style={{ width: '100%', marginTop: 10 }}>
                                <Text style={{ fontSize: 13, color: '#fff', fontWeight: 'bold' }}>Email</Text>
                                    <TextInput
                                    placeholder="Email"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    onFocus={() => setEmailFocused(true)}
                                    onBlur={() => setEmailFocused(false)}
                                    style={[styles.input, emailFocused && styles.inputFocused, { color: '#000' }]}
                                />
                            </View>
                            <View style={{ width: '100%' }}>
                                <Text style={{ fontSize: 13, color: '#fff', fontWeight: 'bold' }}>Password</Text>
                                <View style={[styles.passwordInput, passwordFocused && styles.inputFocused]}>
                                <TextInput
                                    placeholder="Password"
                                    value={password}
                                    onChangeText={setPassword}
                                    autoCapitalize="none"
                                    secureTextEntry={!isPasswordVisible}
                                    onFocus={() => setPasswordFocused(true)}
                                    onBlur={() => setPasswordFocused(false)}
                                    style={{ width: '90%', color: '#000' }}
                                />
                                <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={{ paddingRight: 10 }}>
                                    {isPasswordVisible == true ? (
                                    <Ionicons name="lock-open" color={'#3498db'} size={20} />
                                    ) : (
                                    <Ionicons name="lock-closed" color={'#6C6C6C'} size={20} />
                                    )}
                                </TouchableOpacity>
                                </View>
                            </View>
                            
                            <TouchableOpacity disabled={loginSpinner} onPress={() => handleLogin()} style={[{backgroundColor: loginSpinner == true ? '#f3d96fff' : '#f1c40f'}, styles.button]} >
                                {loginSpinner == true ? (
                                <ActivityIndicator size={'small'} color={'#3498db'} style={{ alignSelf: 'center' }} />
                                ) : (
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Login</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                        {overlay == true && (
                        <Animated.View style={{ backgroundColor: '#00000065', width: width, height: height, opacity: fadeInAnim, position: 'absolute' }} />
                        )}
                        <Animated.View style={{ position: 'absolute', bottom: 0, width: width, height: height - 280, transform: [{ translateY: translateY }], backgroundColor: '#FAFAFA', borderTopLeftRadius: 30, borderTopRightRadius: 30, zIndex: 5, paddingHorizontal: 25, paddingTop: 30 }}>
                            <View>
                                <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Enter 6 Digits Code</Text>
                                <Text style={{ fontSize: 13, marginTop: 25, color: '#545454' }}>Please enter verification code sent to your registered mlgcl email.</Text>
                                <View style={{ marginTop: 20 }}>
                                    <OtpInput numberOfDigits={6} focusColor={'#3498db'} autoFocus={false} onTextChange={(text) => {
                                        setOtpCode(text);
                                        if(text.length == 6) {
                                            Keyboard.dismiss();
                                        }
                                    }} />
                                </View>
                                <View style={{ flexDirection: 'row', alignSelf: 'center', marginTop: 10 }}>
                                    <Text style={{ fontSize: 12, color: '#545454' }}>Didn't receive a code? </Text>
                                    <TouchableOpacity onPress={() => handleResendOtp()}  disabled={isActive} >
                                        <Text style={{ fontSize: 12, textDecorationLine: 'underline', color: isActive == true ? '#78bdebff' : '#3498db' }}>Resend code</Text>
                                    </TouchableOpacity>
                                    {isActive && (
                                    <>
                                        <Text>{` (${timeLeft})`}</Text>
                                    </>
                                    )}
                                </View>
                            </View>
                            <View style={{ flex: 1, position: 'relative' }}>
                                <TouchableOpacity onPress={() => handleOTPValidation()} disabled={otpSpinner} style={{ backgroundColor: otpSpinner == true ? '#5faee2ff' : '#3498db', width: width - 20,
                                    borderRadius: 30, paddingVertical: 12, position: 'absolute', bottom: 60, left: '50%', transform: [{ translateX: '-50%' }] }}>
                                    {otpSpinner == true ? (
                                        <ActivityIndicator size={'small'} color={'#fff'} style={{ alignSelf: 'center' }} />
                                    ) : (
                                        <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center', fontSize: 16 }}>Verify</Text>
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => closeSheet()} style={{ position: 'absolute', bottom: 25, left: '50%', transform: [{ translateX: '-50%' }] }}>
                                    <Text style={{ fontWeight: 'bold', textAlign: 'center', color: '#838383', fontSize: 16 }}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </View>
                </>
            )}
        </View>
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
    logo: {
        width: 250,
        height: 150,
        resizeMode: 'contain',
        alignSelf: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        color: '#fff',
    },

    inputContainer: {
        justifyContent: 'center',
    },

    input: {
        backgroundColor: '#f1f1f1',
        padding: 10,
        borderRadius: 5,
        marginBottom: 5,
        borderWidth: 2,
        borderColor: '#f1f1f1'
    },
    passwordInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f1f1f1',
        paddingHorizontal: 5,
        borderRadius: 5,
        marginBottom: 15,
        borderWidth: 2,
        borderColor: '#f1f1f1'
    },
    button: {
        width: '100%',
        paddingHorizontal: 5,
        paddingVertical: 13,
        borderRadius: 5,
        alignItems: 'center',
    },
    inputFocused: {
        borderColor: '#f1c40f', 
        borderWidth: 2,
    },
});