import { useEffect, useRef } from "react";
import { Animated, Dimensions, Text, View } from "react-native";


const { height, width } = Dimensions.get('screen')

export default function BorrowInfo() {
    const sheetAnimation = useRef(new Animated.Value(width)).current;
    const dataAnimation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        toggleSheet();
    }, [])


    const toggleSheet = () => {
        Animated.timing(sheetAnimation, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true
        }).start();

        Animated.timing(dataAnimation, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true
        }).start()
    }

    const closeToggle = () => {
        Animated.timing(sheetAnimation, {
            toValue: width,
            duration: 200,
            useNativeDriver: true
        }).start();

        Animated.timing(dataAnimation, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true
        }).start()
    }

    return (
        <View style={{ backgroundColor: '#fff', height, paddingTop: 30 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#3498db', height: 100, width, paddingTop: 40, paddingHorizontal: 20 }}>
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Borrow Details</Text>
            </View>

            <Animated.View style={{ paddingHorizontal: 15, transform: [{ translateX: sheetAnimation }], position: 'absolute', width, paddingTop: 20, backgroundColor: '#f1f1f1' }}>
                
            </Animated.View>
        </View>
    )
}