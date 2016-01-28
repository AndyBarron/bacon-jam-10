// '@' Player
// '!' Exit
// ' ' Empty
// '#' Enemy
// '^' Air
// Anything else will look up "objects" and then
//   default to a wall
module.exports = {
  name: "Thinking With Currents",
  data: [
  ' 0000000000000               0000000000000     00000000000000000000000000     ',
  ' 0           0               0           0     0^                       0     ',
  ' 0  @        0               0           0     0^                       0     ',
  ' 000000      0               0  ^        0     0^                       0     ',
  ' 0           0               0  ^  0000  0     0^ ^     0000000000      0     ',
  ' 0           0               0  ^  0  0  000000000^     0000     0      0     ',
  ' 0   a       0000000000000   0  ^  0  0          0^        0     00     0     ',
  ' 0   00000000000         0   0  ^  0  0          0^        0      0     000000',
  ' 0             0         0   0  ^  0  0000000000 0^      ^ 0      0          0',
  ' 0             0^        0   0  ^  0           0^0^      ^ 0      0          0',
  ' 0             0^00000   0   0  ^  0           0^00      ^ 0      0          0',
  ' 0     000     0^0   0   0   0  ^  0           0^0       ^ 0      0   #  0   0',
  ' 00    0 0      ^0   0   0   0  ^  0           0^        ^ 0      00000000   0',
  '       0 0   #  ^0   0   0   0  ^  0           0^        ^ 0      0          0',
  '       0 000000000   0   0   0  ^  0           0^        ^ 0      0          0',
  '       0                 00000  ^  0           0^        ^ 0      0          0',
  '       0                        ^  0           0^        ^ 0      0   0 #    0',
  '       0                        ^  0           00        0 0      0   00000000',
  '       0                        ^^^0           0           0      0          0',
  '       0                 00000  0^^0000000000000           0      0          0',
  '       0                 0   0  0^^                        0      0          0',
  '       0                 0   0  0^^                  #     0      0       !  0',
  '       0                 0   0  0000000000000000000000000000      000000000000',
  ],
  objects: {
    a: "Console|Look before you leap...",
  },
}