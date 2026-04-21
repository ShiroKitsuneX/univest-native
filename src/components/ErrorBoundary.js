import { Component } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { logger } from "@/services/logger";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { err: null };
  }

  static getDerivedStateFromError(err) {
    return { err };
  }

  componentDidCatch(err, info) {
    logger.error("ErrorBoundary caught:", err, info?.componentStack);
  }

  reset = () => this.setState({ err: null });

  render() {
    if (!this.state.err) return this.props.children;
    const msg = this.state.err?.message || String(this.state.err);
    return (
      <View style={{ flex:1, backgroundColor:"#0d1117", padding:24, justifyContent:"center" }}>
        <Text style={{ fontSize:48, textAlign:"center", marginBottom:12 }}>⚠️</Text>
        <Text style={{ color:"#e6edf3", fontSize:20, fontWeight:"800", textAlign:"center", marginBottom:8 }}>Algo deu errado</Text>
        <Text style={{ color:"#8b949e", fontSize:13, textAlign:"center", marginBottom:20 }}>O app encontrou um erro inesperado.</Text>
        <ScrollView style={{ maxHeight:180, backgroundColor:"#161b27", borderRadius:12, padding:12, marginBottom:20 }}>
          <Text style={{ color:"#f87171", fontSize:11, fontFamily:"Courier" }}>{msg}</Text>
        </ScrollView>
        <TouchableOpacity onPress={this.reset} style={{ padding:14, borderRadius:14, backgroundColor:"#00E5A0", alignItems:"center" }}>
          <Text style={{ color:"#000", fontSize:15, fontWeight:"800" }}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }
}
