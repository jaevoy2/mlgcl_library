import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Dimensions, Image, Text, TouchableOpacity, View } from 'react-native';


const logo = require('../assets/images/logo-name.png');
const school = require('../assets/images/school.png');
const { height, width } = Dimensions.get('screen');


export default function Index() {
    const [userInfo, setuserInfo] = useState(null);
    const extras = Constants.expoConfig?.extra ?? {};
    const [request, response, prompAsync] = Google.useAuthRequest({
        // androidClientId: "446081453845-o82p5jk0b6dbm024dl13tvha9da45neb.apps.googleusercontent.com",
        // iosClientId: "446081453845-34vo0e8mkf6rqcv572r2jcqk3pfusqss.apps.googleusercontent.com",
        webClientId: "446081453845-3ig3fkvou3ug1fd8goh6f04jbj4bt2bh.apps.googleusercontent.com",
    });

    useEffect(() => {
        handleSignIn()
    }, [response]);

    const getUserInfo = async (token: any) => {
        if(!token) return;

        try {
            const response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
                headers: { Authorization: `Bearer ${token}` }
            })

            const user =  await response.json();
            await AsyncStorage.setItem('@user', JSON.stringify(user));
           setuserInfo(user); 
        }catch (error) {
            console.log(error);
        }
    }

    const handleSignIn = async () => {
        const user = await AsyncStorage.getItem('@user');
        if(!user) {
            if(response?.type === 'success') {
                await getUserInfo(response.authentication?.accessToken)
            }
        }else {
            setuserInfo(JSON.parse(user));
        }
    }

    return (
        <View style={{ paddingHorizontal: 20 }}>
            <Image source={school} resizeMode='cover' style={{ position: 'absolute', width, height, zIndex: -1, opacity: 0.7 }} />
            <LinearGradient
                colors={['#3498db', 'rgba(52, 152, 219, 0.88)',  'rgba(52, 152, 219, 0.75)', 'rgba(241, 196, 15, 0.57)',]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ height, position: 'absolute', width, top: 0, zIndex: 2 }}
            />
            <View style={{ justifyContent: 'center', alignItems: 'center', height, gap: '40', zIndex: 10 }}>
                <Image source={logo} style={{ height: 80, width: 200 }} />

                <View style={{ flexDirection: 'column', alignItems: 'center', gap: 20, width: '100%' }}>
                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 2 }}>MLGCL LIBRARY</Text>
                    <TouchableOpacity disabled={!request} onPress={() => prompAsync()} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, borderColor: '#FBE704', borderWidth: 1, borderRadius: 50, padding: 10, width: '100%' }}>
                        <Ionicons name={'logo-google'} size={20} color={'#fff'} />
                        <Text style={{ color: '#fff' }}>Sign in with Google</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}