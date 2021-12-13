<script>
  import { curKeypoint, tags } from './stores';

  export let position;
  export const toggleQuickTag = () => {
    quickTag = !quickTag;
    return true;
  };
  export const quickTagAction = (e) => {
    const idx = shortcuts.indexOf(e.key);
    if (quickTag && idx >= 0) {
      tagChecks.children[idx].firstElementChild.click();
    }
  };

  let shortcuts = 'qwerasdfzxcvtyuighjk'.slice(0, $tags.length);
  let tagChecks;
  let quickTag = false;

  let start;
  let end;
  let newLabel;
  let comments;

  const addLabel = () => {
    if (newLabel) {
      $tags = [...$tags, newLabel];
      newLabel = '';
      shortcuts = 'qwerasdfzxcvtyuighjk'.slice(0, $tags.length);
    }
  };
</script>

<div class="tagbox">
  <div class="topRow">
    {#if $curKeypoint.start}
      <label
        >start:
        <input
          bind:value={$curKeypoint.start}
          type="number"
          min="0"
          max={$curKeypoint.end}
          step="0.01"
          placeholder={position}
        />
      </label>
    {:else}
      <label
        >start<input
          bind:value={start}
          type="number"
          min="0"
          step="0.01"
          placeholder={position}
        /></label
      >
    {/if}

    {#if $curKeypoint.end}
      <label
        >end:
        <input
          bind:value={$curKeypoint.end}
          type="number"
          min={$curKeypoint.start}
          step="0.01"
          placeholder="---"
        />
      </label>
    {:else}
      <label
        >end<input
          bind:value={end}
          type="number"
          min="0"
          step="0.01"
          placeholder="---"
        /></label
      >
    {/if}
    <label>quick tag: <input bind:checked={quickTag} type="checkbox" /></label>
    <slot />
  </div>
  <div class="tagChecks" bind:this={tagChecks}>
    {#each $tags as tag, index}
      <div>
        <input
          type="checkbox"
          bind:group={$curKeypoint.tags}
          value={tag}
          id={tag}
        />
        <label for={tag}>
          {tag}
          {quickTag ? `[${[shortcuts[index]]}]` : ''}
        </label>
      </div>
    {/each}
    <div class:hidden={quickTag}>
      <input
        type="text"
        placeholder="new label"
        bind:value={newLabel}
        style="width:70px"
      /><button on:click={addLabel}>+</button>
    </div>
  </div>
  <textarea bind:value={$curKeypoint.comments} class:hidden={quickTag} />
</div>

<style>
  input[type='number'] {
    width: 90px;
  }
  textarea {
    width: 100%;
  }
  input[type='checkbox'] {
    vertical-align: middle;
    margin-bottom: 0px;
    margin-top: 0px;
  }
  input {
    margin-right: 3px;
    margin-left: 3px;
  }
  /*	.bottom-container {
	    display: grid;
	    grid-template-columns: 1fr 1fr;
	    grid-gap: 10px;
	}*/
  .tagChecks {
    display: flex;
    flex-flow: row wrap;
    justify-content: space-evenly;
  }
  .hidden {
    visibility: hidden;
  }
  input[type='checkbox']:disabled + label {
    color: #1e429f;
    font-weight: bolder;
  }
  textarea {
    resize: vertical;
  }
  .topRow {
    background-color: #d6d3ff;
    padding-left: 10px;
    padding-bottom: 2px;
    padding-top: 8px;
    margin-bottom: 6px;
  }
</style>
