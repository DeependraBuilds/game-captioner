"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { findGames, GAME_CATALOG } from "@/lib/game-catalog";

type Props = { value: string; onChange: (game: string) => void };
export function GameSelector({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const [opened, setOpened] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const results = findGames(value);
  const select = (game: string) => {
    onChange(game);
    setOpened(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };
  const onKeyboard = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      if (opened) event.preventDefault();
      setOpened(false);
      setActiveIndex(-1);
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpened(true);
      setActiveIndex(index => {
        if (!results.length) return -1;
        if (event.key === "ArrowDown") return (index + 1) % results.length;
        return (index <= 0 ? results.length : index) - 1;
      });
    } else if (event.key === "Enter" && opened && activeIndex >= 0 && results[activeIndex]) {
      event.preventDefault();
      select(results[activeIndex].title);
    }
  };
  return <div className="game-selector" onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setOpened(false);
      setActiveIndex(-1);
    }
  }}>
    <div className="game-selector-field">
      <input
        ref={inputRef}
        id="game"
        role="combobox"
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={opened}
        aria-controls={listId}
        aria-activedescendant={opened && activeIndex >= 0 ? listId + "-" + activeIndex : undefined}
        maxLength={80}
        value={value}
        placeholder="Search games or enter a custom title..."
        onFocus={() => setOpened(true)}
        onClick={() => setOpened(true)}
        onChange={event => { onChange(event.target.value); setOpened(true); setActiveIndex(-1); }}
        onKeyDown={onKeyboard}
      />
      <button type="button" className="game-selector-toggle" aria-label={opened ? "Close game list" : "Browse games"}
        aria-expanded={opened} aria-controls={listId}
        onMouseDown={event => event.preventDefault()}
        onClick={() => { inputRef.current?.focus(); setOpened(!opened); setActiveIndex(-1); }}>⌄</button>
    </div>
    {opened && <div className="game-selector-menu" id={listId} role="listbox" aria-label="Suggested games">
      <div className="game-selector-menu-heading">
        <span>{value.trim() ? "MATCHING GAMES" : "POPULAR PICKS"}</span>
        <span>{value.trim() ? results.length + " shown" : GAME_CATALOG.length + " in catalog"}</span>
      </div>
      {results.length ? results.map((game, index) => (
        <button key={game.title} type="button" role="option" aria-selected={activeIndex === index}
          id={listId + "-" + index}
          className={"game-selector-option" + (activeIndex === index ? " is-active" : "")}
          onMouseDown={event => event.preventDefault()}
          onClick={() => select(game.title)}>
          <span className="game-selector-title">{game.title}</span>
          <span className="game-selector-category">{game.category}</span>
        </button>
      )) : <div className="game-selector-no-results">No catalog match. You can still use <strong>{value.trim()}</strong> as your custom game title.</div>}
      <div className="game-selector-menu-footer">Don&apos;t see it? Type the game name and continue. Any game is supported.</div>
    </div>}
    <p className="game-selector-help">{GAME_CATALOG.length} curated games across genres, or type your own.</p>
  </div>;
}
