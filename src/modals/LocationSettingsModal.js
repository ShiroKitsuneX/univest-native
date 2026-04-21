import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useTheme } from "../theme/useTheme";
import { BottomSheet } from "../components/BottomSheet";
import { GEO_DATA } from "../data/geo";
import { useProfileStore } from "../stores/profileStore";
import { useGeoStore } from "../stores/geoStore";

export function LocationSettingsModal({ visible, onClose }) {
  const { T, isDark, AT } = useTheme();

  const countryId = useProfileStore(s => s.countryId);
  const setCountryId = useProfileStore(s => s.setCountryId);
  const stateId = useProfileStore(s => s.stateId);
  const setStateId = useProfileStore(s => s.setStateId);
  const cityId = useProfileStore(s => s.cityId);
  const setCityId = useProfileStore(s => s.setCityId);
  const studyCountryId = useProfileStore(s => s.studyCountryId);
  const setStudyCountryId = useProfileStore(s => s.setStudyCountryId);
  const studyStateId = useProfileStore(s => s.studyStateId);
  const setStudyStateId = useProfileStore(s => s.setStudyStateId);
  const studyCityId = useProfileStore(s => s.studyCityId);
  const setStudyCityId = useProfileStore(s => s.setStudyCityId);

  const states = useGeoStore(s => s.states);
  const cities = useGeoStore(s => s.cities);

  const getState = (id) => states.find(s => s.id === id) || GEO_DATA.states.find(s => s.id === id);
  const getCity = (id) => cities.find(c => c.id === id) || GEO_DATA.cities.find(c => c.id === id);
  const getStatesForCountry = (cid) => {
    const fromDb = states.filter(s => s.countryId === cid);
    if (fromDb.length > 0) return fromDb;
    return GEO_DATA.states.filter(s => s.countryId === cid);
  };
  const getCitiesForState = (sid) => {
    const fromDb = cities.filter(c => c.stateId === sid);
    if (fromDb.length > 0) return fromDb;
    return GEO_DATA.cities.filter(c => c.stateId === sid);
  };
  const getCityDisplayName = (id) => getCity(id)?.name || "";
  const getStateDisplayName = (id) => getState(id)?.name || "";

  const [tmpCountryId, setTmpCountryId] = useState("");
  const [tmpStateId, setTmpStateId] = useState("");
  const [tmpCityId, setTmpCityId] = useState("");
  const [tmpStudyCountryId, setTmpStudyCountryId] = useState("");
  const [tmpStudyStateId, setTmpStudyStateId] = useState("");
  const [tmpStudyCityId, setTmpStudyCityId] = useState("");
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showStudyStatePicker, setShowStudyStatePicker] = useState(false);
  const [showStudyCityPicker, setShowStudyCityPicker] = useState(false);

  useEffect(() => {
    if (visible) {
      setTmpCountryId(countryId || "BR");
      setTmpStateId(stateId);
      setTmpCityId(cityId);
      setTmpStudyCountryId(studyCountryId || "BR");
      setTmpStudyStateId(studyStateId);
      setTmpStudyCityId(studyCityId);
      setShowStatePicker(false);
      setShowCityPicker(false);
      setShowStudyStatePicker(false);
      setShowStudyCityPicker(false);
    }
  }, [visible]);

  const lbl = { color:T.muted, fontSize:10, fontWeight:"700", textTransform:"uppercase", letterSpacing:0.8 };

  return (
    <BottomSheet visible={visible} onClose={onClose} T={T}>
      <View style={{ flex:1, paddingBottom:20 }}>
        <View style={{ flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingHorizontal:20, paddingVertical:12, borderBottomWidth:1, borderBottomColor:T.border }}>
          <TouchableOpacity onPress={onClose} style={{ width:34, height:34, borderRadius:17, backgroundColor:T.card2, alignItems:"center", justifyContent:"center" }}>
            <Text style={{ color:T.sub, fontSize:18 }}>←</Text>
          </TouchableOpacity>
          <Text style={{ color:T.text, fontSize:18, fontWeight:"800" }}>📍 Localização</Text>
          <View style={{ width:34 }} />
        </View>
        <ScrollView style={{ flex:1 }} keyboardShouldPersistTaps="handled">
          <View style={{ padding:20 }}>
            <View style={{ backgroundColor:T.card2, borderRadius:16, padding:16, marginBottom:16 }}>
              <Text style={{ color:T.accent, fontSize:14, fontWeight:"800", marginBottom:12 }}>📍 Sua localização atual</Text>

              <Text style={[lbl,{marginBottom:6}]}>Estado</Text>
              <TouchableOpacity onPress={() => setShowStatePicker(!showStatePicker)} style={{ flexDirection:"row", alignItems:"center", justifyContent:"space-between", padding:12, borderRadius:12, backgroundColor:T.inp, borderWidth:1, borderColor:T.inpB }}>
                <Text style={{ color:T.text, fontSize:14 }}>{tmpStateId ? getStateDisplayName(tmpStateId) : "Selecione o estado"}</Text>
                <Text style={{ color:T.muted, fontSize:14 }}>▼</Text>
              </TouchableOpacity>
              {showStatePicker && (
                <View style={{ marginTop:8, backgroundColor:T.card, borderRadius:12, maxHeight:200, borderWidth:1, borderColor:T.border }}>
                  <ScrollView style={{ maxHeight:190 }}>
                    {getStatesForCountry(tmpCountryId||"BR").map(s => (
                      <TouchableOpacity key={s.id} onPress={() => {setTmpStateId(s.id);setTmpCityId("");setShowStatePicker(false);}} style={{ padding:12, borderBottomWidth:1, borderBottomColor:T.border }}>
                        <Text style={{ color:T.text, fontSize:14 }}>{s.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              <Text style={[lbl,{marginTop:12, marginBottom:6}]}>Cidade</Text>
              <TouchableOpacity onPress={() => tmpStateId ? setShowCityPicker(!showCityPicker) : null} disabled={!tmpStateId} style={{ flexDirection:"row", alignItems:"center", justifyContent:"space-between", padding:12, borderRadius:12, backgroundColor:T.inp, borderWidth:1, borderColor:T.inpB, opacity:tmpStateId?1:0.5 }}>
                <Text style={{ color:T.text, fontSize:14 }}>{tmpCityId ? getCityDisplayName(tmpCityId) : (tmpStateId ? "Selecione a cidade" : "Selecione o estado primeiro")}</Text>
                <Text style={{ color:T.muted, fontSize:14 }}>▼</Text>
              </TouchableOpacity>
              {showCityPicker && tmpStateId && (
                <View style={{ marginTop:8, backgroundColor:T.card, borderRadius:12, maxHeight:200, borderWidth:1, borderColor:T.border }}>
                  <ScrollView style={{ maxHeight:190 }}>
                    {getCitiesForState(tmpStateId).map(c => (
                      <TouchableOpacity key={c.id} onPress={() => {setTmpCityId(c.id);setShowCityPicker(false);}} style={{ padding:12, borderBottomWidth:1, borderBottomColor:T.border }}>
                        <Text style={{ color:T.text, fontSize:14 }}>{c.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <View style={{ backgroundColor:T.card2, borderRadius:16, padding:16, marginBottom:16 }}>
              <Text style={{ color:T.accent, fontSize:14, fontWeight:"800", marginBottom:12 }}>🎯 Destino de estudos</Text>

              <Text style={[lbl,{marginBottom:6}]}>Estado</Text>
              <TouchableOpacity onPress={() => setShowStudyStatePicker(!showStudyStatePicker)} style={{ flexDirection:"row", alignItems:"center", justifyContent:"space-between", padding:12, borderRadius:12, backgroundColor:T.inp, borderWidth:1, borderColor:T.inpB }}>
                <Text style={{ color:T.text, fontSize:14 }}>{tmpStudyStateId ? getStateDisplayName(tmpStudyStateId) : "Selecione o estado"}</Text>
                <Text style={{ color:T.muted, fontSize:14 }}>▼</Text>
              </TouchableOpacity>
              {showStudyStatePicker && (
                <View style={{ marginTop:8, backgroundColor:T.card, borderRadius:12, maxHeight:200, borderWidth:1, borderColor:T.border }}>
                  <ScrollView style={{ maxHeight:190 }}>
                    {getStatesForCountry(tmpStudyCountryId||"BR").map(s => (
                      <TouchableOpacity key={s.id} onPress={() => {setTmpStudyStateId(s.id);setTmpStudyCityId("");setShowStudyStatePicker(false);}} style={{ padding:12, borderBottomWidth:1, borderBottomColor:T.border }}>
                        <Text style={{ color:T.text, fontSize:14 }}>{s.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              <Text style={[lbl,{marginTop:12, marginBottom:6}]}>Cidade</Text>
              <TouchableOpacity onPress={() => tmpStudyStateId ? setShowStudyCityPicker(!showStudyCityPicker) : null} disabled={!tmpStudyStateId} style={{ flexDirection:"row", alignItems:"center", justifyContent:"space-between", padding:12, borderRadius:12, backgroundColor:T.inp, borderWidth:1, borderColor:T.inpB, opacity:tmpStudyStateId?1:0.5 }}>
                <Text style={{ color:T.text, fontSize:14 }}>{tmpStudyCityId ? getCityDisplayName(tmpStudyCityId) : (tmpStudyStateId ? "Selecione a cidade" : "Selecione o estado primeiro")}</Text>
                <Text style={{ color:T.muted, fontSize:14 }}>▼</Text>
              </TouchableOpacity>
              {showStudyCityPicker && tmpStudyStateId && (
                <View style={{ marginTop:8, backgroundColor:T.card, borderRadius:12, maxHeight:200, borderWidth:1, borderColor:T.border }}>
                  <ScrollView style={{ maxHeight:190 }}>
                    {getCitiesForState(tmpStudyStateId).map(c => (
                      <TouchableOpacity key={c.id} onPress={() => {setTmpStudyCityId(c.id);setShowStudyCityPicker(false);}} style={{ padding:12, borderBottomWidth:1, borderBottomColor:T.border }}>
                        <Text style={{ color:T.text, fontSize:14 }}>{c.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <TouchableOpacity onPress={()=>{
              setCountryId(tmpCountryId||"BR");
              setStateId(tmpStateId);
              setCityId(tmpCityId);
              setStudyCountryId(tmpStudyCountryId||"BR");
              setStudyStateId(tmpStudyStateId);
              setStudyCityId(tmpStudyCityId);
              setShowStatePicker(false);setShowCityPicker(false);setShowStudyStatePicker(false);setShowStudyCityPicker(false);
              onClose();
            }} style={{ padding:16, borderRadius:16, backgroundColor:T.accent, alignItems:"center" }}>
              <Text style={{ color:AT, fontSize:16, fontWeight:"800" }}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </BottomSheet>
  );
}
