import { Dimensions, View } from "react-native";


const { height, width } = Dimensions.get('screen')

export default function ReservationView() {
    return (
        <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#3498db', height: 100, width, paddingTop: 40, paddingHorizontal: 20 }}>

            </View>
        </View>
    )
}