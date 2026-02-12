export const getLocalizedText = (obj: any, key: string) => {
    if (!obj) return 'Unknown'
    const val = obj[key]
    if (typeof val === 'string') return val
    if (typeof val === 'object' && val !== null) {
        return val.en || val.az || val.ru || Object.values(val)[0] || 'Unknown'
    }
    return 'Unknown'
}
