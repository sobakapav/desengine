// @openSpec capability: architecture-roadmap
// @openSpec scenarios:
// @openSpec  - "Родитель маршрутизирует downstream change через dispatcher-architecture"
// @openSpec  - "Предметный dispatcher остаётся owner, если граница уже определена"
// @openSpec  - "Изменение архитектурной границы требует evidence-пакет"

import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

function readDoc(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), "utf8")
}

describe("architecture routing playbook docs", () => {
  it("фиксирует критерии маршрутизации между architecture и предметными dispatcher-линиями", () => {
    const source = readDoc("docs/architecture/routing/playbook.md")

    expect(source).toContain("Когда change должен идти через `dispatcher-architecture`")
    expect(source).toContain("Когда change нужно отдавать предметному dispatcher")
    expect(source).toContain("decision matrix")
    expect(source).toContain("Какие доказательства требовать при изменении архитектурной границы")
    expect(source).toContain("Когда достаточно evidence без parent ownership у `dispatcher-architecture`")
  })

  it("фиксирует naming discipline как architectural signal, а не вкусовое правило", () => {
    const source = readDoc("docs/architecture/naming-discipline.md")

    expect(source).toContain("какую ответственность она держит в архитектуре")
    expect(source).toContain("Когда naming становится routing-сигналом")
    expect(source).toContain("Избегай анонимных контейнеров")
    expect(source).toContain("Минимум, который должен показать change")
  })

  it("фиксирует обязательный evidence для boundary и interaction contract", () => {
    const source = readDoc("docs/architecture/boundary-interaction-contracts.md")

    expect(source).toContain("Boundary contract описывает")
    expect(source).toContain("Минимальная структура evidence для boundary change")
    expect(source).toContain("Ограничения зависимостей")
    expect(source).toContain("Что требовать от downstream change")
  })
})
