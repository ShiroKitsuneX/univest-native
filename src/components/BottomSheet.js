import { View, Modal, ScrollView, TouchableOpacity } from "react-native";

export function BottomSheet({ visible, onClose, children, T }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex:1, backgroundColor:"rgba(0,0,0,.72)", justifyContent:"flex-end" }}>
        <TouchableOpacity activeOpacity={1} style={{ backgroundColor:T.card, borderTopLeftRadius:24, borderTopRightRadius:24, minHeight:"92%", maxHeight:"98%", borderTopWidth:1, borderColor:T.border }}>
          <View style={{ width:36, height:4, backgroundColor:T.border, borderRadius:2, alignSelf:"center", marginTop:12, marginBottom:4 }} />
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} style={{ flex:1 }}>{children}</ScrollView>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
