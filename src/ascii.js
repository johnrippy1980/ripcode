'use strict';

// ASCII art constants for RipCode easter eggs

const SOLO_FRAMES = [
  `\x1b[31m
    \\m/  ___
     |  |~~~|
     |  |   |
    / \\  ~~~
  \x1b[0m`,
  `\x1b[33m
   \\m/   ___
    \\|  |~~~|
     |  |   |
    / \\  ~~~
  \x1b[0m`,
  `\x1b[32m
  \\m/ \\m/ ___
    \\|/  |~~~|
     |   |   |
    / \\   ~~~
  \x1b[0m`,
  `\x1b[36m
        ___
  \\m/  |~~~| *
   |\\  |   |/
   | \\ ~~~
  / \\
  \x1b[0m`,
  `\x1b[35m
  * . * . * . *
  \\m/ \\m/ \\m/
    \\|/  |~~~|
     |   |   |
    / \\   ~~~
  SHRED COMPLETE!
  \x1b[0m`,
];

const SKULL = `\x1b[31m
    _____
   /     \\
  | () () |
   \\  ^  /
    |||||
  \x1b[0m`;

const HORNS_666 = `\x1b[31m
  \\m/           \\m/
   ||  6  6  6  ||
   ||           ||
  \x1b[33m  NUMBER OF THE
   BEAST MODE
  \x1b[31m  ACTIVATED \\m/
  \x1b[0m`;

const CREDITS = [
  '',
  '\x1b[1m\x1b[35m=== R I P C O D E ===\x1b[0m',
  '',
  '\x1b[36mLead Shredder\x1b[0m ........... johnrippy80',
  '\x1b[36mMosh Pit Engineer\x1b[0m ...... The Transpiler',
  '\x1b[36mNoise Consultant\x1b[0m ....... console.log',
  '\x1b[36mStage Manager\x1b[0m .......... Node.js',
  '\x1b[36mPyrotechnics\x1b[0m ........... The Parser',
  '\x1b[36mSecurity (Brace)\x1b[0m ....... try/catch',
  '\x1b[36mCrowd Control\x1b[0m .......... Promise.all',
  '\x1b[36mRoadie\x1b[0m ................. npm',
  '\x1b[36mGroupie\x1b[0m ................ GitHub Copilot',
  '\x1b[36mInspiration\x1b[0m ............ Coffee & Distortion',
  '',
  '\x1b[2mNo amplifiers were harmed in the making of this language.\x1b[0m',
  '',
  '\x1b[1m\\m/ RIP IT. SHIP IT. \\m/\x1b[0m',
  '',
];

const LORE_TEXT = `\x1b[32m
> Year: 2049. The frameworks have won.
> Every app is 900MB of node_modules.
> Developers have forgotten how to code
> without 47 layers of abstraction.
>
> But deep in the underground...
> a language was FORGED in fire.
> It didn't ask for permission.
> It didn't need a config file.
> It just... RIPPED.
>
> They called it RipCode.
> And nothing was ever the same.
>
> \\m/ Rip it. Ship it. \\m/
\x1b[0m`;

const NOISE_BARS = [
  `\x1b[2m  whisper  ${'|'.repeat(2)}  \x1b[0m\x1b[2m............barely audible\x1b[0m`,
  `\x1b[37m  say      ${'|'.repeat(5)}  \x1b[0m\x1b[37mnormal conversation\x1b[0m`,
  `\x1b[33m  yell     ${'|'.repeat(8)}  \x1b[0m\x1b[33m!! warning level !!\x1b[0m`,
  `\x1b[31m  scream   ${'|'.repeat(12)} \x1b[0m\x1b[31m!!! EVERYTHING IS ON FIRE !!!\x1b[0m`,
];

const WELCOME = `
\x1b[35m\x1b[1m  First time? Welcome to the pit.  \x1b[0m

  \x1b[36mQuick start:\x1b[0m
    rip run examples/hello.rip   \x1b[2m— your first shred\x1b[0m
    rip init my-project          \x1b[2m— scaffold a project\x1b[0m
    rip help                     \x1b[2m— see all commands\x1b[0m

  \x1b[33mHidden stuff:\x1b[0m
    There are secrets in this CLI.
    Try things. Break things. \\m/

\x1b[2m  (You won't see this message again)\x1b[0m
`;

const VERSION_TAGLINES = [
  'Louder than your linter.',
  'Zero dependencies. Maximum distortion.',
  'Transpile or die.',
  'Your code called. It wants to shred.',
  'Born in the mosh pit of compilers.',
  'JavaScript with the safety off.',
  'No semicolons were harmed. We killed them all.',
  "Pipes so clean they'd make Mario jealous.",
  'Forged in fire. Shipped in fury.',
  'The language your framework warned you about.',
];

const GOLDEN_BANNER = `
\x1b[33m\x1b[1m   ____  _       ____          _
  |  _ \\(_)_ __ / ___|___   __| | ___
  | |_) | | '_ \\ |   / _ \\ / _\` |/ _ \\
  |  _ <| | |_) | |__| (_) | (_| |  __/
  |_| \\_\\_| .__/ \\____\\___/ \\__,_|\\___|
           |_|
  >>> L E G E N D A R Y   M O D E <<<\x1b[0m
`;

const BUILD_CELEBRATIONS = [
  '\\m/ >_< \\m/ SHREDDED!',
  'That build was BRUTAL.',
  'Another one ripped to shreds.',
];

module.exports = {
  SOLO_FRAMES,
  SKULL,
  HORNS_666,
  CREDITS,
  LORE_TEXT,
  NOISE_BARS,
  WELCOME,
  VERSION_TAGLINES,
  GOLDEN_BANNER,
  BUILD_CELEBRATIONS,
};
