import { create } from "zustand"
import type { GuidanceNavigationStore, GuidanceNavigationState, Screen, Category, Question } from "../types"
import { useLocaleStore } from "@/languages/stores/locale-store"
const initialState: GuidanceNavigationState = {
  data: {
    version: "1.0.0",
    languages: [],
    categories: [],
    questions: []
  },
  screen: "home",
  selectedCategory: null,
  currentQuestions: [],
  currentQuestion: null,
  currentAnswer: null,
  currentAttachment: null,
  breadcrumbs: [],
  navigationHistory: [],
  lastSelectedQuestionId: null,
}

export const useGuidanceNavigationStore = create<GuidanceNavigationStore>()((set, get) => ({
  ...initialState,

  setScreen: (screen: Screen) => set({ screen }),

  selectCategory: (category: Category, getText: (text: any) => string) => {
    const { data } = get()
    // data.questions contains only root questions (parentId === null) due to buildTree logic
    // We want to show all root questions that belong to this category
    const categoryQuestions = data.questions.filter((q) => q.categoryId === category.id)

    set({
      selectedCategory: category,
      currentQuestions: categoryQuestions,
      currentQuestion: null,
      breadcrumbs: [{ id: category.id, label: getText(category.name), type: "category" }],
      navigationHistory: [],
      screen: "questions",
      lastSelectedQuestionId: null,
    })
  },

  selectQuestion: (question: Question, getText: (text: any) => string) => {
    const { currentQuestions, currentQuestion, breadcrumbs, navigationHistory } = get()

    const newHistory = [...navigationHistory, { questions: currentQuestions, question: currentQuestion }]
    const newBreadcrumbs = [
      ...breadcrumbs,
      { id: question.id, label: getText(question.question), type: "question" as const },
    ]

    if (question.answer && (!question.subQuestions || question.subQuestions.length === 0)) {
      set({
        currentAnswer: getText(question.answer),
        currentAttachment: (() => {
          const { locale } = useLocaleStore.getState()
          const attachments = question.attachments
          if (!attachments) return null
          return attachments[locale] || attachments.az || null
        })(),
        breadcrumbs: newBreadcrumbs,
        navigationHistory: newHistory,
        screen: "answer",
        lastSelectedQuestionId: question.id,
        currentQuestion: question,
      })
    } else if (question.subQuestions && question.subQuestions.length > 0) {
      set({
        currentQuestions: question.subQuestions,
        currentQuestion: question,
        breadcrumbs: newBreadcrumbs,
        navigationHistory: newHistory,
        lastSelectedQuestionId: question.id,
      })
    }
  },

  goBack: () => {
    const { screen, navigationHistory, breadcrumbs } = get()

    if (screen === "answer") {
      const lastHistory = navigationHistory[navigationHistory.length - 1]
      set({
        currentQuestions: lastHistory?.questions || [],
        currentQuestion: lastHistory?.question || null,
        navigationHistory: navigationHistory.slice(0, -1),
        breadcrumbs: breadcrumbs.slice(0, -1),
        currentAnswer: null,
        screen: "questions",
      })
    } else if (screen === "questions") {
      if (navigationHistory.length > 0) {
        const lastHistory = navigationHistory[navigationHistory.length - 1]
        set({
          currentQuestions: lastHistory.questions,
          currentQuestion: lastHistory.question,
          navigationHistory: navigationHistory.slice(0, -1),
          breadcrumbs: breadcrumbs.slice(0, -1),
        })
      } else {
        set({
          screen: "categories",
          selectedCategory: null,
          currentQuestions: [],
          currentQuestion: null,
          breadcrumbs: [],
        })
      }
    } else if (screen === "categories") {
      set({ screen: "home" })
    }
  },

  goHome: () => set(initialState),

  goToCategories: () => set({
    screen: "categories",
    selectedCategory: null,
    currentQuestions: [],
    currentQuestion: null,
    currentAnswer: null,
    breadcrumbs: [],
    navigationHistory: [],
    lastSelectedQuestionId: null,
  }),

  initialize: async (baseUrl: string = "") => {
    try {
      const [catsRes, questionsRes] = await Promise.all([
        fetch(`${baseUrl}/api/categories`, { cache: 'no-store' }),
        fetch(`${baseUrl}/api/questions`, { cache: 'no-store' })
      ])

      if (!catsRes.ok || !questionsRes.ok) throw new Error("Failed to fetch data")

      const categories = await catsRes.json()
      const allQuestions = await questionsRes.json() // Flat list

      // Build Tree
      const buildTree = (questions: any[], parentId: string | null = null): Question[] => {
        return questions
          .filter(q => q.parentId === parentId)
          .map(q => ({
            ...q,
            // Map translations to expected format if needed, assuming API returns compatible structure
            // API uses 'translations' array, frontend types might expect 'question: { az: ... }'
            // need to transform
            name: q.translations ? q.translations.reduce((acc: any, t: any) => ({ ...acc, [t.language]: t.name }), {}) : q.name,
            question: q.translations ? q.translations.reduce((acc: any, t: any) => ({ ...acc, [t.language]: t.question }), {}) : q.question,
            answer: q.translations ? q.translations.reduce((acc: any, t: any) => ({ ...acc, [t.language]: t.answer }), {}) : q.answer,
            attachments: q.translations ? q.translations.reduce((acc: any, t: any) => ({
              ...acc,
              [t.language]: t.attachmentUrl ? { url: t.attachmentUrl, name: t.attachmentName } : null
            }), {}) : {},
            subQuestions: buildTree(questions, q.id)
          }))
          .sort((a, b) => (a.order || 0) - (b.order || 0))
      }

      const treeQuestions = buildTree(allQuestions, null)

      // Transform categories translations and sort
      const transformedCategories = categories
        .map((c: any) => ({
          ...c,
          name: c.translations ? c.translations.reduce((acc: any, t: any) => ({ ...acc, [t.language]: t.name }), {}) : c.name,
        }))
        .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))

      set(state => ({
        data: {
          ...state.data,
          categories: transformedCategories,
          questions: treeQuestions
        }
      }))

    } catch (e) {
      console.error("Initialization failed", e)
    }
  }
}))
