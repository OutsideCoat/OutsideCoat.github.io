/* generate_json.js
 * Builds a JSON representation of the introduction form and shows it with syntax highlighting.
 */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("introduction-form");
  const generateButton = document.getElementById("generateJsonButton");
  const generatedContainer = document.getElementById("generated-introduction");
  const pageHeading = document.querySelector("#intro-form h2");
  const helperHeading = document.querySelector("#intro-form h3");
  const clearButton = document.getElementById("clearButton");
  const pictureUploadInput = document.getElementById("pictureUpload");

  if (!form || !generateButton || !generatedContainer || !pageHeading) {
    return;
  }

  const originalHeading = pageHeading.textContent || "Introduction Form";

  const resetView = () => {
    generatedContainer.hidden = true;
    generatedContainer.innerHTML = "";
    form.hidden = false;
    pageHeading.textContent = originalHeading;
    if (helperHeading) {
      helperHeading.removeAttribute("hidden");
    }
  };

  const valueOf = (selector, fallback = "") => {
    const field = form.querySelector(selector);
    if (field && typeof field.value === "string") {
      const trimmed = field.value.trim();
      return trimmed.length > 0 ? trimmed : fallback;
    }
    return fallback;
  };

  const collectFormData = () => {
    const courseRows = Array.from(form.querySelectorAll("#courseList .course-row"));
    const linkRows = Array.from(form.querySelectorAll("#linkList .link-row"));
    const firstName = valueOf("#firstName");
    const preferredName = valueOf("#nickname");
    const middleName = valueOf("#middleName");
    const lastName = valueOf("#lastName");
    const divider = valueOf("#divider", "~");
    const pictureUrl = valueOf("#pictureUrl", "images/headshot.jpg");

    const courses = courseRows
      .map((row) => {
        const inputs = row.querySelectorAll("input");
        const department = inputs[0] && typeof inputs[0].value === "string" ? inputs[0].value.trim() : "";
        const number = inputs[1] && typeof inputs[1].value === "string" ? inputs[1].value.trim() : "";
        const name = inputs[2] && typeof inputs[2].value === "string" ? inputs[2].value.trim() : "";
        const reason = inputs[3] && typeof inputs[3].value === "string" ? inputs[3].value.trim() : "";
        return { department, number, name, reason };
      })
      .filter(
        (course) =>
          course.department.length > 0 ||
          course.number.length > 0 ||
          course.name.length > 0 ||
          course.reason.length > 0
      );

    const links = linkRows
      .map((row) => {
        const inputs = row.querySelectorAll("input");
        const label = inputs[0] && typeof inputs[0].value === "string" ? inputs[0].value.trim() : "";
        const url = inputs[1] && typeof inputs[1].value === "string" ? inputs[1].value.trim() : "";
        return { name: label, href: url };
      })
      .filter((link) => link.name.length > 0 && link.href.length > 0);

    const data = {
      firstName,
      preferredName,
      middleInitial: middleName,
      lastName,
      divider,
      mascotAdjective: valueOf("#mascotAdjective"),
      mascotAnimal: valueOf("#mascotAnimal"),
      image: pictureUrl,
      imageCaption: valueOf("#pictureCaption"),
      personalStatement: valueOf("#personalStatement"),
      personalBackground: valueOf("#personalBackground"),
      professionalBackground: valueOf("#professionalBackground"),
      academicBackground: valueOf("#academicBackground"),
      subjectBackground: valueOf("#subjectBackground"),
      primaryComputer: valueOf("#computerPlatform"),
      courses,
      links
    };

    const pictureFile =
      pictureUploadInput && pictureUploadInput.files && pictureUploadInput.files.length > 0
        ? pictureUploadInput.files[0]
        : null;

    return { data, pictureFile, fallbackImage: pictureUrl };
  };

  const showJson = (jsonString) => {
    generatedContainer.innerHTML = "";

    const outputSection = document.createElement("section");
    outputSection.className = "generated-json-output";

    const pre = document.createElement("pre");
    pre.className = "generated-json-code";

    const code = document.createElement("code");
    code.className = "language-json";
    code.textContent = jsonString;

    pre.appendChild(code);
    outputSection.appendChild(pre);

    const controls = document.createElement("p");
    controls.className = "reset-link";

    const backButton = document.createElement("button");
    backButton.type = "button";
    backButton.className = "return-to-form";
    backButton.textContent = "Return to Form";

    controls.appendChild(backButton);
    outputSection.appendChild(controls);

    generatedContainer.appendChild(outputSection);

    generatedContainer.hidden = false;
    form.hidden = true;
    pageHeading.textContent = "Introduction HTML";
    if (helperHeading) {
      helperHeading.setAttribute("hidden", "hidden");
    }

    if (window.hljs && typeof window.hljs.highlightElement === "function") {
      window.hljs.highlightElement(code);
    }

    backButton.addEventListener("click", () => {
      resetView();
    });
  };

  const handleGeneration = () => {
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const { data, pictureFile, fallbackImage } = collectFormData();

    const finalize = (imageSource) => {
      const outputData = { ...data, image: imageSource || fallbackImage };
      const jsonString = JSON.stringify(outputData, null, 2);
      showJson(jsonString);
    };

    if (pictureFile) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        const result = reader.result;
        if (typeof result === "string" && result.length > 0) {
          finalize(result);
        } else {
          finalize(fallbackImage);
        }
      });
      reader.readAsDataURL(pictureFile);
    } else {
      finalize(fallbackImage);
    }
  };

  generateButton.addEventListener("click", handleGeneration);

  form.addEventListener("reset", () => {
    window.setTimeout(() => {
      resetView();
    }, 0);
  });

  if (clearButton) {
    clearButton.addEventListener("click", () => {
      window.setTimeout(() => {
        pageHeading.textContent = originalHeading;
      }, 0);
    });
  }
});
