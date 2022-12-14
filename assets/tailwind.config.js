module.exports = {
  content: ["**/*.{liquid,js}"],
  theme: {
    fontFamily: {
      sans: ["Grotesk", "RebondGrotesque", "sans"],
      rebond: ["RebondGrotesque", "sans"],
      "rebond-bold": ["RebondGrotesqueBold", "sans"],
    },
    extend: {
      colors: {
        creme: {
          DEFAULT: "#F8F2E7",
        },
        jaune: {
          DEFAULT: "#F4FFAF",
        },
        acajou: {
          DEFAULT: "#733E2B",
        },
        orange: {
          DEFAULT: "#F84C55",
        },
        sable: {
          DEFAULT: "#E8E2DB",
        },
        ecorce: {
          DEFAULT: "#3A0F00",
        },
        blanc: {
          DEFAULT: "#FFFFFF",
        },
        gray: {
          dark: "#201A1C",
          medium: "#B1B1B1",
          light: "#E0E0E0",
        },
        chataigne: {
          DEFAULT: "#927254",
        },
        beige: {
          DEFAULT: "#FFF7ED",
        },
      },

      animation: {
        dash: "dash 1.4s ease-in-out infinite",
        marquee: "marquee 5s linear infinite",
      },
      translate: {
        "-50%": "-50%",
      },
      keyframes: {
        dash: {
          "0%": {
            "stroke-dashoffset": 280,
          },
          "50%": {
            "stroke-dashoffset": 75,
            transform: " rotate(135deg)",
          },
          "100%": {
            "stroke-dashoffset": 280,
            transform: "rotate(450deg)",
          },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-100%)" },
        },
      },
    },
  },
  plugins: [
    // LOADING STATE
    ((plugin, config) => ({
      handler: plugin,
      config,
    }))(({ addVariant, e }) => {
      addVariant("loading", ({ modifySelectors, separator }) => {
        modifySelectors(({ className }) => {
          return `.${e(`loading${separator}${className}`)}[loading="true"]`;
        });
      });
    }),
    ((plugin, config) => ({
      handler: plugin,
      config,
    }))(({ addVariant, e }) => {
      addVariant("group-loading", ({ modifySelectors, separator }) => {
        modifySelectors(({ className }) => {
          return `.group[loading="true"] .${e(
            `group-loading${separator}${className}`
          )}`;
        });
      });
    }),
    // DROPZONE STATE
    ((plugin, config) => ({
      handler: plugin,
      config,
    }))(({ addVariant, e }) => {
      addVariant("prevented", ({ modifySelectors, separator }) => {
        modifySelectors(({ className }) => {
          return `.${e(
            `prevented${separator}${className}`
          )}[data-prevented="true"]`;
        });
      });
    }),
    ((plugin, config) => ({
      handler: plugin,
      config,
    }))(({ addVariant, e }) => {
      addVariant("group-prevented", ({ modifySelectors, separator }) => {
        modifySelectors(({ className }) => {
          return `.group[data-prevented="true"] .${e(
            `group-prevented${separator}${className}`
          )}`;
        });
      });
    }),
    ((plugin, config) => ({
      handler: plugin,
      config,
    }))(({ addVariant, e }) => {
      addVariant("accepted", ({ modifySelectors, separator }) => {
        modifySelectors(({ className }) => {
          return `.${e(`accepted${separator}${className}`)}[accepted="true"]`;
        });
      });
    }),
    ((plugin, config) => ({
      handler: plugin,
      config,
    }))(({ addVariant, e }) => {
      addVariant("group-accepted", ({ modifySelectors, separator }) => {
        modifySelectors(({ className }) => {
          return `.group[data-accepted="true"] .${e(
            `group-accepted${separator}${className}`
          )}`;
        });
      });
    }),
    // EXPANDED STATE
    ((plugin, config) => ({
      handler: plugin,
      config,
    }))(({ addVariant, e }) => {
      addVariant("expanded", ({ modifySelectors, separator }) => {
        modifySelectors(({ className }) => {
          return `.${e(
            `expanded${separator}${className}`
          )}[aria-expanded="true"]`;
        });
      });
    }),
    ((plugin, config) => ({
      handler: plugin,
      config,
    }))(({ addVariant, e }) => {
      addVariant("group-expanded", ({ modifySelectors, separator }) => {
        modifySelectors(({ className }) => {
          return `.group[aria-expanded="true"] .${e(
            `group-expanded${separator}${className}`
          )}`;
        });
      });
    }),
    // SELECTED STATE
    ((plugin, config) => ({
      handler: plugin,
      config,
    }))(({ addVariant, e }) => {
      addVariant("selected", ({ modifySelectors, separator }) => {
        modifySelectors(({ className }) => {
          return `.${e(
            `selected${separator}${className}`
          )}[aria-selected="true"]`;
        });
      });
    }),
    ((plugin, config) => ({
      handler: plugin,
      config,
    }))(({ addVariant, e }) => {
      addVariant("group-selected", ({ modifySelectors, separator }) => {
        modifySelectors(({ className }) => {
          return `.group[aria-selected="true"] .${e(
            `group-selected${separator}${className}`
          )}`;
        });
      });
    }),
    ((plugin, config) => ({
      handler: plugin,
      config,
    }))(({ addVariant, e }) => {
      addVariant("disabled", ({ modifySelectors, separator }) => {
        modifySelectors(({ className }) => {
          return `.${e(`disabled${separator}${className}`)}:disabled , .${e(
            `disabled${separator}${className}`
          )}[disabled="true"]`;
        });
      });
    }),
    // TRANSITIONING STATES
    ((plugin, config) => ({
      handler: plugin,
      config,
    }))(({ addVariant, e }) => {
      addVariant("in", ({ modifySelectors, separator }) => {
        modifySelectors(({ className }) => {
          return `.${e(`in${separator}${className}`)}[data-transition="in"]`;
        });
      });
    }),
    ((plugin, config) => ({
      handler: plugin,
      config,
    }))(({ addVariant, e }) => {
      addVariant("exiting", ({ modifySelectors, separator }) => {
        modifySelectors(({ className }) => {
          return `.${e(
            `exiting${separator}${className}`
          )}[data-transition="exiting"]`;
        });
      });
    }),
    ((plugin, config) => ({
      handler: plugin,
      config,
    }))(({ addVariant, e }) => {
      addVariant("entering", ({ modifySelectors, separator }) => {
        modifySelectors(({ className }) => {
          return `.${e(
            `entering${separator}${className}`
          )}[data-transition="entering"]`;
        });
      });
    }),
    ((plugin, config) => ({
      handler: plugin,
      config,
    }))(({ addVariant, e }) => {
      addVariant("out", ({ modifySelectors, separator }) => {
        modifySelectors(({ className }) => {
          return `.${e(`out${separator}${className}`)}[data-transition="out"]`;
        });
      });
    }),
    // GROUP TRANSITIONING STATES
    ((plugin, config) => ({
      handler: plugin,
      config,
    }))(({ addVariant, e }) => {
      addVariant("group-in", ({ modifySelectors, separator }) => {
        modifySelectors(({ className }) => {
          return `.group[data-transition="in"] .${e(
            `group-in${separator}${className}`
          )}`;
        });
      });
    }),
    ((plugin, config) => ({
      handler: plugin,
      config,
    }))(({ addVariant, e }) => {
      addVariant("group-exiting", ({ modifySelectors, separator }) => {
        modifySelectors(({ className }) => {
          return `.group[data-transition="exiting"] .${e(
            `group-exiting${separator}${className}`
          )}`;
        });
      });
    }),
    ((plugin, config) => ({
      handler: plugin,
      config,
    }))(({ addVariant, e }) => {
      addVariant("group-entering", ({ modifySelectors, separator }) => {
        modifySelectors(({ className }) => {
          return `.group[data-transition="entering"] .${e(
            `group-entering${separator}${className}`
          )}`;
        });
      });
    }),
    ((plugin, config) => ({
      handler: plugin,
      config,
    }))(({ addVariant, e }) => {
      addVariant("group-out", ({ modifySelectors, separator }) => {
        modifySelectors(({ className }) => {
          return `.group[data-transition="out"] .${e(
            `group-out${separator}${className}`
          )}`;
        });
      });
    }),
    // FIRST ELEMENT
    ((plugin, config) => ({
      handler: plugin,
      config,
    }))(({ addVariant, e }) => {
      addVariant("first-element", ({ modifySelectors, separator }) => {
        modifySelectors(({ className }) => {
          return `.${e(
            `first-element${separator}${className}`
          )} > *:first-child`;
        });
      });
    }),
    ((plugin, config) => ({
      handler: plugin,
      config,
    }))(({ addVariant, e }) => {
      addVariant("group-scoped-hover", ({ modifySelectors, separator }) => {
        modifySelectors(({ className }) => {
          return `.group-scoped:hover > .${e(
            `group-scoped-hover${separator}${className}`
          )}`;
        });
      });
    }),
    ((plugin, config) => ({
      handler: plugin,
      config,
    }))(
      ({ matchUtilities, addUtilities, theme, variants, e }) => {
        const values = theme("lineClamp");

        matchUtilities(
          {
            "line-clamp": (value) => ({
              overflow: "hidden",
              display: "-webkit-box",
              "-webkit-box-orient": "vertical",
              "-webkit-line-clamp": `${value}`,
            }),
          },
          { values }
        );

        addUtilities(
          [
            {
              ".line-clamp-none": {
                "-webkit-line-clamp": "unset",
              },
            },
          ],
          variants("lineClamp")
        );
      },
      {
        theme: {
          lineClamp: {
            1: "1",
            2: "2",
            3: "3",
            4: "4",
            5: "5",
            6: "6",
          },
        },
        variants: {
          lineClamp: ["responsive"],
        },
      }
    ),
  ],
};
