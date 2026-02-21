<script setup lang="ts"></script>

<template>
  <div class="flex flex-col gap-5 rounded-xl text-sm leading-relaxed max-w-sm">
    <section class="flex flex-col gap-3">
      <h3 class="font-bold text-base">The philosophy</h3>

      <p class="">
        To acquire speed, you shouldn't just play at a fixed tempo. True progress happens
        when you stretch your nervous system to its limit and then "settle" into a new,
        faster comfort zone.
      </p>

      <div class="flex flex-col gap-4">
        <div
          class="bg-zinc-100 dark:bg-zinc-800/50 shadow-md p-3 rounded-lg border-l-4 border-green-600 dark:border-green-500"
        >
          <div
            class="text-green-600 dark:text-green-400 font-bold text-xs mb-1 uppercase tracking-wider"
          >
            Step 1: Start
          </div>
          <div class="dark:text-white font-semibold mb-1 italic text-xs">
            Slow & Controlled
          </div>
          <p class="text-xs dark:text-zinc-200">
            Establish perfect accuracy and muscle memory at a comfortable baseline.
          </p>
        </div>

        <div
          class="bg-zinc-100 dark:bg-zinc-800/50 shadow-md p-3 rounded-lg border-l-4 border-red-600 dark:border-red-500"
        >
          <div
            class="text-red-600 dark:text-red-400 font-bold text-xs mb-1 uppercase tracking-wider"
          >
            Step 2: Peak
          </div>
          <div class="dark:text-white font-semibold mb-1 italic text-xs">
            Pushing the Limit
          </div>
          <p class="text-xs dark:text-zinc-200">
            Ramp up to a tempo that challenges your top speed to "shock" your physical
            limits.
          </p>
        </div>

        <div
          class="bg-zinc-100 dark:bg-zinc-800/50 shadow-md p-3 rounded-lg border-l-4 border-yellow-600 dark:border-yellow-500"
        >
          <div
            class="text-yellow-600 dark:text-yellow-400 font-bold text-xs mb-1 uppercase tracking-wider"
          >
            Step 3: Settle
          </div>
          <div class="dark:text-white font-semibold mb-1 italic text-xs">
            The New Normal
          </div>
          <p class="text-xs dark:text-zinc-200">
            Landing at an intermediate speed that is faster than where you started.
          </p>
        </div>
      </div>
    </section>

    <hr class="border-zinc-300 dark:border-zinc-700" />

    <section class="flex flex-col gap-3">
      <h3 class="font-bold text-base flex items-center gap-2">Settings guide</h3>

      <div class="grid gap-4">
        <div>
          <span class="font-semibold block mb-1">Tempo Points</span>
          <p class="text-xs leading-normal">
            Adjust the <span class="text-green-500">Start</span>,
            <span class="text-red-500">Peak</span>, and
            <span class="text-yellow-500">End</span> BPM directly on the grid or via
            settings to shape the ramp.
          </p>
        </div>

        <div>
          <span class="font-semibold block mb-1">Bars Per Cell</span>
          <p class="text-xs leading-normal">
            Determines the "length" of each horizontal block. Increasing this makes the
            total exercise longer.
          </p>
        </div>

        <div>
          <span class="font-semibold block mb-1">Beats per bar</span>
          <p class="text-xs leading-normal">
            Select how many beats you want to play per bar, from 1 to 9.
          </p>
        </div>

        <div>
          <span class="font-semibold block mb-1">Increase Tempo</span>
          <div class="flex flex-col gap-1.5 mt-1 text-xs">
            <div class="">
              <span
                class="font-semibold text-blue-500 dark:text-blue-200 whitespace-nowrap"
              >
                Every bar:
              </span>

              <span class="">
                Changes BPM only when moving to a new cell (Stepped).
              </span>
            </div>
            <div class="">
              <span
                class="font-semibold text-blue-500 dark:text-blue-200 whitespace-nowrap"
              >
                Every cell:
              </span>

              <span class="">Recalculates BPM every single bar (Smooth ramp).</span>
            </div>
          </div>
        </div>

        <div class="flex items-start gap-2">
          <div>
            <span class="font-semibold block">Stop at End</span>
            <p class="text-xs">
              When enabled, the metronome will automatically stop once the playhead
              reaches the end of the 16th cell.
            </p>
          </div>
        </div>
      </div>
    </section>

    <hr class="border-zinc-300 dark:border-zinc-700" />

    <section class="flex flex-col gap-3">
      <h3 class="font-bold text-base">Presets management</h3>
      <p class="">
        In the header, you will find a
        <span class="text-blue-500 dark:text-white font-semibold italic">Presets</span>
        button. This opens a manager where you can:
      </p>
      <ul class="list-disc list-inside flex flex-col gap-2 text-xs">
        <li>
          <span class="font-semibold">Load:</span> Switch between your saved ramp
          configurations.
        </li>
        <li>
          <span class="font-semibold">Rename:</span> Personalize your presets for specific
          exercises.
        </li>
        <li>
          <span class="font-semibold">Delete:</span> Remove configurations you no longer
          need.
        </li>
      </ul>
    </section>
  </div>
</template>
