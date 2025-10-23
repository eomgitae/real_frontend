const BASE = 'http://localhost:8000'

// 백엔드 API를 통한 함수들
export const backendApi = {
    // 고객 관리 CRUD
    async getCustomers() {
        const res = await fetch(`${BASE}/customers`)
        if (!res.ok) throw new Error(`GET /customers ${res.status}`)
        return res.json()
    },

    async getCustomer(customerNo: number) {
        const res = await fetch(`${BASE}/customers/${customerNo}`)
        if (!res.ok) throw new Error(`GET /customers/${customerNo} ${res.status}`)
        return res.json()
    },

    async createCustomer(payload: {
        customer_name: string
        phone: string
        account_no: string
        account_balance: number
        estimated_total_assets: number
        investment_personality: number
        grade: string
    }) {
        const res = await fetch(`${BASE}/customers`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error(`POST /customers ${res.status}`)
        return res.json()
    },

    async updateCustomer(customerNo: number, payload: {
        customer_name?: string
        phone?: string
        account_no?: string
        account_balance?: number
        estimated_total_assets?: number
        investment_personality?: number
        grade?: string
    }) {
        const res = await fetch(`${BASE}/customers/${customerNo}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error(`PUT /customers/${customerNo} ${res.status}`)
        return res.json()
    },

    async deleteCustomer(customerNo: number) {
        const res = await fetch(`${BASE}/customers/${customerNo}`, {
            method: "DELETE",
        })
        if (!res.ok) throw new Error(`DELETE /customers/${customerNo} ${res.status}`)
        return res.json()
    },

    // 상담 내역 관리 CRUD
    async getConsultations(customerNo?: string, limit = 20, offset = 0) {
        const params = new URLSearchParams()
        if (customerNo) params.append('customer_no', customerNo)
        params.append('limit', limit.toString())
        params.append('offset', offset.toString())
        
        console.log(`백엔드 API 호출: ${BASE}/consultation?${params}`)
        
        try {
            const res = await fetch(`${BASE}/consultation?${params}`)
            console.log('응답 상태:', res.status, res.statusText)
            
            if (!res.ok) {
                const errorText = await res.text()
                console.error('API 오류 응답:', errorText)
                throw new Error(`GET /consultation ${res.status}: ${errorText}`)
            }
            
            const result = await res.json()
            console.log('API 응답 데이터:', result)
            
            // 백엔드에서 반환하는 형태에 맞게 데이터 추출
            return result.data || result
        } catch (error) {
            console.error('API 호출 실패:', error)
            throw error
        }
    },

    async getConsultation(consultationNo: number) {
        const res = await fetch(`${BASE}/consultation/${consultationNo}`)
        if (!res.ok) throw new Error(`GET /consultation/${consultationNo} ${res.status}`)
        return res.json()
    },

    async createConsultation(payload: {
        customer_no: number
        consulted_at: string
        branch_name: string
        topic: string
        summary: string
    }) {
        const res = await fetch(`${BASE}/consultation`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error(`POST /consultation ${res.status}`)
        return res.json()
    },

    async updateConsultation(consultationNo: number, payload: {
        customer_no?: number
        consulted_at?: string
        branch_name?: string
        topic?: string
        summary?: string
    }) {
        const res = await fetch(`${BASE}/consultation/${consultationNo}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error(`PUT /consultation/${consultationNo} ${res.status}`)
        return res.json()
    },

    async deleteConsultation(consultationNo: number) {
        const res = await fetch(`${BASE}/consultation/${consultationNo}`, {
            method: "DELETE",
        })
        if (!res.ok) throw new Error(`DELETE /consultation/${consultationNo} ${res.status}`)
        return res.json()
    },

    // 팩트체크 관리 CRUD
    async getFactChecks(consultationNo?: number) {
        const params = new URLSearchParams()
        if (consultationNo) params.append('consultation_no', consultationNo.toString())
        
        console.log(`팩트체크 API 호출: ${BASE}/factchecks?${params}`)
        
        try {
            const res = await fetch(`${BASE}/factchecks?${params}`)
            console.log('팩트체크 응답 상태:', res.status, res.statusText)
            
            if (!res.ok) {
                const errorText = await res.text()
                console.error('팩트체크 API 오류 응답:', errorText)
                throw new Error(`GET /factchecks ${res.status}: ${errorText}`)
            }
            
            const result = await res.json()
            console.log('팩트체크 API 응답 데이터:', result)
            return result
        } catch (error) {
            console.error('팩트체크 API 호출 실패:', error)
            throw error
        }
    },

    async getFactCheck(factcheckNo: number) {
        const res = await fetch(`${BASE}/factchecks/${factcheckNo}`)
        if (!res.ok) throw new Error(`GET /factchecks/${factcheckNo} ${res.status}`)
        return res.json()
    },

    async createFactCheck(payload: {
        consultation_no: number
        customer_no: number
        severity: string
        detected_statement: string
        correction_suggestion: string
        related_law: string
    }) {
        const res = await fetch(`${BASE}/factchecks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error(`POST /factchecks ${res.status}`)
        return res.json()
    },

    async updateFactCheck(factcheckNo: number, payload: {
        consultation_no?: number
        customer_no?: number
        severity?: string
        detected_statement?: string
        correction_suggestion?: string
        related_law?: string
    }) {
        const res = await fetch(`${BASE}/factchecks/${factcheckNo}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error(`PUT /factchecks/${factcheckNo} ${res.status}`)
        return res.json()
    },

    async deleteFactCheck(factcheckNo: number) {
        const res = await fetch(`${BASE}/factchecks/${factcheckNo}`, {
            method: "DELETE",
        })
        if (!res.ok) throw new Error(`DELETE /factchecks/${factcheckNo} ${res.status}`)
        return res.json()
    },

    // 기존 호환성 함수들
    async getFactChecksByConsultation(consultationId: number) {
        return this.getFactChecks(consultationId)
    },

    async testSupabaseConnection() {
        const res = await fetch(`${BASE}/test-supabase`)
        if (!res.ok) throw new Error(`GET /test-supabase ${res.status}`)
        return res.json()
    },

    async createTestData() {
        const res = await fetch(`${BASE}/create-test-data`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        })
        if (!res.ok) throw new Error(`POST /create-test-data ${res.status}`)
        return res.json()
    }
}
