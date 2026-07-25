import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 12, color: "#333" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 40 },
  title: { fontSize: 24, fontWeight: "bold", color: "#111" },
  section: { marginBottom: 20 },
  label: { fontSize: 10, color: "#666", textTransform: "uppercase" },
  value: { fontSize: 12, fontWeight: "bold", marginTop: 4 },
  table: { display: "flex", width: "auto", marginTop: 20 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#eee", paddingVertical: 8 },
  tableHeader: { fontWeight: "bold", color: "#666" },
  col1: { width: "40%" },
  col2: { width: "20%", textAlign: "right" },
  col3: { width: "20%", textAlign: "right" },
  col4: { width: "20%", textAlign: "right" },
  summary: { marginTop: 30, alignItems: "flex-end" },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", width: "40%", paddingVertical: 4 },
  totalRow: { fontWeight: "bold", fontSize: 14, marginTop: 8, borderTopWidth: 1, borderTopColor: "#333", paddingTop: 8 }
});

export const InvoiceTemplate = ({ invoice }: { invoice: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>INVOICE</Text>
          <Text style={{ marginTop: 8, color: "#666" }}>#{invoice.invoiceNumber}</Text>
        </View>
        <View style={{ textAlign: "right" }}>
          <Text style={styles.title}>Nexus Billing</Text>
          <Text style={{ marginTop: 8, color: "#666" }}>123 Admin Lane, NY 10001</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 30 }}>
        <View style={styles.section}>
          <Text style={styles.label}>Billed To</Text>
          <Text style={styles.value}>{invoice.client.name}</Text>
          <Text style={{ marginTop: 2 }}>{invoice.client.company || ""}</Text>
          <Text style={{ marginTop: 2, color: "#666" }}>{invoice.client.email}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Issue Date</Text>
          <Text style={styles.value}>{new Date(invoice.issueDate).toLocaleDateString()}</Text>
          
          <Text style={[styles.label, { marginTop: 12 }]}>Due Date</Text>
          <Text style={styles.value}>{new Date(invoice.dueDate).toLocaleDateString()}</Text>
        </View>
      </View>

      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={styles.col1}>Description</Text>
          <Text style={styles.col2}>Qty</Text>
          <Text style={styles.col3}>Unit Price</Text>
          <Text style={styles.col4}>Amount</Text>
        </View>
        {invoice.items.map((item: any) => (
          <View key={item.id} style={styles.tableRow}>
            <Text style={styles.col1}>{item.description}</Text>
            <Text style={styles.col2}>{item.quantity}</Text>
            <Text style={styles.col3}>${item.unitPrice.toFixed(2)}</Text>
            <Text style={styles.col4}>${(item.quantity * item.unitPrice).toFixed(2)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={{ color: "#666" }}>Subtotal:</Text>
          <Text>${invoice.subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={{ color: "#666" }}>Tax:</Text>
          <Text>${invoice.taxTotal.toFixed(2)}</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text>Total Due:</Text>
          <Text>${invoice.total.toFixed(2)}</Text>
        </View>
      </View>
    </Page>
  </Document>
);
