import React, { useState, useMemo } from "react";
import {
  Mic,
  ArrowLeftRight,
  Search,
  Pin,
  GlobeIcon,
  Mail,
  Settings,
  X,
  AlertCircle,
  Clock,
  Copy,
  EllipsisVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import OpenAI from "openai";
import TranslateText from "./TranslateText";
import ReactTextareaAutosize from "react-textarea-autosize";
import { detectLanguage, languageNameMap } from "./detectLanguage";
import { Separator } from "@/components/ui/separator";

// Language data
const commonLanguages = [
  { code: "eng", name: "English" },
  { code: "spa", name: "Español", nameEn: "Spanish" },
  { code: "cmn", name: "中文", nameEn: "Chinese" },
  { code: "hin", name: "हिन्दी", nameEn: "Hindi" },
  { code: "arb", name: "العربية", nameEn: "Arabic" },
  { code: "por", name: "Português", nameEn: "Portuguese" },
  { code: "ben", name: "বাংলা", nameEn: "Bengali" },
  { code: "rus", name: "Русский", nameEn: "Russian" },
  { code: "jpn", name: "日本語", nameEn: "Japanese" },
  { code: "fra", name: "Français", nameEn: "French" },
];

const recentLanguages = [
  { code: "spa", name: "Español", nameEn: "Spanish" },
  { code: "eng", name: "English" },
  { code: "fra", name: "Français", nameEn: "French" },
];

const allLanguages = [
  { code: "afr", name: "Afrikaans", nameEn: "Afrikaans", region: "Africa" },
  { code: "sqi", name: "Albanian", nameEn: "Albanian", region: "Europe" },
  { code: "amh", name: "Amharic", nameEn: "Amharic", region: "Africa" },
  { code: "arb", name: "Arabic", nameEn: "Arabic", region: "MENA" }, // Middle East and North Africa
  { code: "hye", name: "Armenian", nameEn: "Armenian", region: "Asia" }, // Primarily in the Caucasus region
  { code: "asm", name: "Assamese", nameEn: "Assamese", region: "Asia" }, // Northeast India
  { code: "aze", name: "Azerbaijani", nameEn: "Azerbaijani", region: "Asia" }, // Caucasus region
  { code: "eus", name: "Basque", nameEn: "Basque", region: "Europe" }, // Border of Spain and France
  { code: "bel", name: "Belarusian", nameEn: "Belarusian", region: "Europe" },
  { code: "ben", name: "Bengali", nameEn: "Bengali", region: "Asia" }, // Bangladesh and India
  { code: "bos", name: "Bosnian", nameEn: "Bosnian", region: "Europe" },
  { code: "bul", name: "Bulgarian", nameEn: "Bulgarian", region: "Europe" },
  { code: "mya", name: "Burmese", nameEn: "Burmese", region: "Asia" }, // Myanmar
  { code: "cat", name: "Catalan", nameEn: "Catalan", region: "Europe" }, // Spain
  { code: "ceb", name: "Cebuano", nameEn: "Cebuano", region: "Asia" }, // Philippines
  { code: "nya", name: "Chichewa", nameEn: "Chichewa", region: "Africa" }, // Malawi
  { code: "cmn", name: "Chinese", nameEn: "Mandarin", region: "Asia" }, // Primarily China
  { code: "hrv", name: "Croatian", nameEn: "Croatian", region: "Europe" },
  { code: "ces", name: "Czech", nameEn: "Czech", region: "Europe" },
  { code: "dan", name: "Danish", nameEn: "Danish", region: "Europe" },
  { code: "nld", name: "Dutch", nameEn: "Dutch", region: "Europe" },
  { code: "eng", name: "English", nameEn: "English", region: "Global" },
  { code: "epo", name: "Esperanto", nameEn: "Esperanto", region: "Global" }, // Constructed language
  { code: "est", name: "Estonian", nameEn: "Estonian", region: "Europe" },
  { code: "fin", name: "Finnish", nameEn: "Finnish", region: "Europe" },
  { code: "fra", name: "French", nameEn: "French", region: "Europe" },
  { code: "glg", name: "Galician", nameEn: "Galician", region: "Europe" }, // Spain
  { code: "kat", name: "Georgian", nameEn: "Georgian", region: "Asia" }, // Caucasus region
  { code: "deu", name: "German", nameEn: "German", region: "Europe" },
  { code: "ell", name: "Greek", nameEn: "Greek", region: "Europe" },
  { code: "guj", name: "Gujarati", nameEn: "Gujarati", region: "Asia" }, // India
  {
    code: "hat",
    name: "Haitian Creole",
    nameEn: "Haitian Creole",
    region: "Americas",
  }, // Haiti
  { code: "hau", name: "Hausa", nameEn: "Hausa", region: "Africa" }, // West Africa
  { code: "heb", name: "Hebrew", nameEn: "Hebrew", region: "MENA" },
  { code: "hin", name: "Hindi", nameEn: "Hindi", region: "Asia" }, // India
  { code: "hmn", name: "Hmong", nameEn: "Hmong", region: "Asia" }, // Southeast Asia
  { code: "hun", name: "Hungarian", nameEn: "Hungarian", region: "Europe" },
  { code: "isl", name: "Icelandic", nameEn: "Icelandic", region: "Europe" },
  { code: "ibo", name: "Igbo", nameEn: "Igbo", region: "Africa" }, // Nigeria
  { code: "ind", name: "Indonesian", nameEn: "Indonesian", region: "Asia" },
  { code: "gle", name: "Irish", nameEn: "Irish", region: "Europe" },
  { code: "ita", name: "Italian", nameEn: "Italian", region: "Europe" },
  { code: "jpn", name: "Japanese", nameEn: "Japanese", region: "Asia" },
  { code: "jav", name: "Javanese", nameEn: "Javanese", region: "Asia" }, // Indonesia
  { code: "kan", name: "Kannada", nameEn: "Kannada", region: "Asia" }, // India
  { code: "kaz", name: "Kazakh", nameEn: "Kazakh", region: "Asia" }, // Central Asia
  { code: "khm", name: "Khmer", nameEn: "Khmer", region: "Asia" }, // Cambodia
  { code: "kor", name: "Korean", nameEn: "Korean", region: "Asia" },
  { code: "kur", name: "Kurdish", nameEn: "Kurdish", region: "MENA" }, // Middle East
  { code: "kir", name: "Kyrgyz", nameEn: "Kyrgyz", region: "Asia" }, // Central Asia
  { code: "lao", name: "Lao", nameEn: "Lao", region: "Asia" }, // Laos
  { code: "lat", name: "Latin", nameEn: "Latin", region: "Europe" }, // Ancient Europe
  { code: "lav", name: "Latvian", nameEn: "Latvian", region: "Europe" },
  { code: "lit", name: "Lithuanian", nameEn: "Lithuanian", region: "Europe" },
  {
    code: "ltz",
    name: "Luxembourgish",
    nameEn: "Luxembourgish",
    region: "Europe",
  },
  { code: "mkd", name: "Macedonian", nameEn: "Macedonian", region: "Europe" },
  { code: "mlg", name: "Malagasy", nameEn: "Malagasy", region: "Africa" }, // Madagascar
  { code: "msa", name: "Malay", nameEn: "Malay", region: "Asia" }, // Southeast Asia
  { code: "mal", name: "Malayalam", nameEn: "Malayalam", region: "Asia" }, // India
  { code: "mlt", name: "Maltese", nameEn: "Maltese", region: "Europe" },
  { code: "mri", name: "Maori", nameEn: "Maori", region: "Oceania" }, // New Zealand
  { code: "mar", name: "Marathi", nameEn: "Marathi", region: "Asia" }, // India
  { code: "mon", name: "Mongolian", nameEn: "Mongolian", region: "Asia" },
  { code: "nep", name: "Nepali", nameEn: "Nepali", region: "Asia" }, // Nepal
  { code: "nor", name: "Norwegian", nameEn: "Norwegian", region: "Europe" },
  { code: "ori", name: "Odia", nameEn: "Odia", region: "Asia" }, // India
  { code: "pus", name: "Pashto", nameEn: "Pashto", region: "MENA" }, // Afghanistan and Pakistan
  { code: "prs", name: "Persian", nameEn: "Persian", region: "MENA" }, // Iran
  { code: "pol", name: "Polish", nameEn: "Polish", region: "Europe" },
  { code: "por", name: "Portuguese", nameEn: "Portuguese", region: "Americas" }, // Also spoken in Europe and Africa
  { code: "pan", name: "Punjabi", nameEn: "Punjabi", region: "Asia" }, // India and Pakistan
  { code: "ron", name: "Romanian", nameEn: "Romanian", region: "Europe" },
  { code: "rus", name: "Russian", nameEn: "Russian", region: "Europe" },
  { code: "smo", name: "Samoan", nameEn: "Samoan", region: "Oceania" },
  {
    code: "gla",
    name: "Scots Gaelic",
    nameEn: "Scots Gaelic",
    region: "Europe",
  }, // Scotland
  { code: "srp", name: "Serbian", nameEn: "Serbian", region: "Europe" },
  { code: "sna", name: "Shona", nameEn: "Shona", region: "Africa" }, // Zimbabwe
  { code: "sin", name: "Sinhala", nameEn: "Sinhala", region: "Asia" }, // Sri Lanka
  { code: "slk", name: "Slovak", nameEn: "Slovak", region: "Europe" },
  { code: "slv", name: "Slovenian", nameEn: "Slovenian", region: "Europe" },
  { code: "som", name: "Somali", nameEn: "Somali", region: "Africa" }, // Horn of Africa
  { code: "spa", name: "Spanish", nameEn: "Spanish", region: "Americas" }, // Also spoken in Europe
  { code: "sun", name: "Sundanese", nameEn: "Sundanese", region: "Asia" }, // Indonesia
  { code: "swa", name: "Swahili", nameEn: "Swahili", region: "Africa" }, // East Africa
  { code: "swe", name: "Swedish", nameEn: "Swedish", region: "Europe" },
  { code: "tgl", name: "Tagalog", nameEn: "Tagalog", region: "Asia" }, // Philippines
  { code: "tgk", name: "Tajik", nameEn: "Tajik", region: "Asia" }, // Central Asia
  { code: "tam", name: "Tamil", nameEn: "Tamil", region: "Asia" }, // India and Sri Lanka
  { code: "tat", name: "Tatar", nameEn: "Tatar", region: "Asia" }, // Russia
  { code: "tel", name: "Telugu", nameEn: "Telugu", region: "Asia" }, // India
  { code: "tha", name: "Thai", nameEn: "Thai", region: "Asia" },
  { code: "tur", name: "Turkish", nameEn: "Turkish", region: "Europe" }, // Also spoken in Asia
  { code: "ukr", name: "Ukrainian", nameEn: "Ukrainian", region: "Europe" },
  { code: "urd", name: "Urdu", nameEn: "Urdu", region: "Asia" }, // Pakistan and India
  { code: "uig", name: "Uyghur", nameEn: "Uyghur", region: "Asia" }, // China
  { code: "uzb", name: "Uzbek", nameEn: "Uzbek", region: "Asia" }, // Central Asia
  { code: "vie", name: "Vietnamese", nameEn: "Vietnamese", region: "Asia" },
  { code: "cym", name: "Welsh", nameEn: "Welsh", region: "Europe" }, // Wales
  { code: "xho", name: "Xhosa", nameEn: "Xhosa", region: "Africa" }, // South Africa
  { code: "yid", name: "Yiddish", nameEn: "Yiddish", region: "Europe" }, // Historically Europe
  { code: "yor", name: "Yoruba", nameEn: "Yoruba", region: "Africa" }, // Nigeria
  { code: "zul", name: "Zulu", nameEn: "Zulu", region: "Africa" }, // South Africa
];

const needsTranslation = (lang: any) => {
  return lang.name.match(
    /[\u0600-\u06FF]|[\u0900-\u097F]|[\u0E00-\u0E7F]|[\u0400-\u04FF]|[\u3040-\u309F]|[\u30A0-\u30FF]|[\u4E00-\u9FFF]|[\uAC00-\uD7AF]|[\u0370-\u03FF]/
  );
};

const LanguageSelector = ({
  open,
  setOpen,
  value,
  onChange,
  placeholder,
}: any) => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("recent");

  const filteredLanguages = useMemo(() => {
    const searchLower = search.toLowerCase();
    const languageList =
      activeTab === "recent"
        ? recentLanguages
        : activeTab === "common"
        ? commonLanguages
        : allLanguages;

    return languageList.filter(
      (lang) =>
        lang.name.toLowerCase().includes(searchLower) ||
        lang.code.toLowerCase().includes(searchLower) ||
        (lang.nameEn && lang.nameEn.toLowerCase().includes(searchLower))
    );
  }, [search, activeTab]);

  const renderLanguageButton = (lang: any) => (
    <Button
      key={lang.code}
      variant="ghost"
      className="w-full justify-start text-left"
      onClick={() => {
        onChange(lang);
        setOpen(false);
      }}
    >
      {activeTab === "recent" && <Clock className="mr-2 h-4 w-4" />}
      {activeTab === "common" && <Pin className="mr-2 h-4 w-4" />}
      <div>
        <span>{lang.name}</span>
        {needsTranslation(lang) && (
          <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">
            ({lang.nameEn})
          </span>
        )}
      </div>
    </Button>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <div className="flex items-center truncate">
            <GlobeIcon className="mr-2 h-4 w-4 flex-shrink-0 hidden md:inline" />
            <span className="truncate">
              {value.name}
              {/* {needsTranslation(value) && (
                <span className="text-gray-500 dark:text-gray-400 text-sm ml-1">
                  ({value.nameEn})
                </span>
              )} */}
            </span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="recent" className="w-1/3">
              Recientes
            </TabsTrigger>
            <TabsTrigger value="common" className="w-1/3">
              Comunes
            </TabsTrigger>
            <TabsTrigger value="all" className="w-1/3">
              Todos
            </TabsTrigger>
          </TabsList>

          <div className="p-2">
            <Input
              placeholder="Buscar idioma..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-2"
            />

            <div className="max-h-64 overflow-y-auto">
              {filteredLanguages.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No se encontraron resultados
                </div>
              ) : activeTab === "all" ? (
                Object.entries(
                  filteredLanguages.reduce(
                    (acc: Record<string, any[]>, lang: any) => {
                      if (!acc[lang.region]) acc[lang.region] = [];
                      acc[lang.region].push(lang);
                      return acc;
                    },
                    {}
                  )
                ).map(([region, langs]) => (
                  <div key={region}>
                    <div className="px-2 py-1 text-sm font-semibold text-gray-500">
                      {region}
                    </div>
                    {langs.map(renderLanguageButton)}
                  </div>
                ))
              ) : (
                filteredLanguages.map(renderLanguageButton)
              )}
            </div>
          </div>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};

const renderTranslatedText = (message: string) => {
  const parts = message.split(/(```[\s\S]*?```)/g);

  return parts.map((part, index) => {
    if (part.startsWith("```") && part.endsWith("```")) {
      const codeContent = part.slice(3, -3).trim();
      const firstLine = codeContent.split("\n")[0].trim();
      const languageMatch = firstLine.match(/^\s*(\w+)/);
      const language = languageMatch ? languageMatch[1] : "javascript";
      const code = codeContent.replace(firstLine, "").trim();

      return (
        <pre
          key={index}
          style={{
            backgroundColor: "#1e1e1e",
            color: "#d4d4d4",
            borderRadius: "8px",
            padding: "10px",
            fontSize: "12px",
            overflowX: "auto",
            marginTop: "10px",
            marginBottom: "10px",
            lineHeight: "20px",
          }}
        >
          <code className={`language-${language}`}>{code}</code>
        </pre>
      );
    } else {
      // Detect and format titles, subtitles, italics, and lists
      const titlePattern = /##\s*(.*)/g;
      const subtitlePattern = /\*\*(.*?)\*\*/g;
      const italicPattern = /(\*|_)(.*?)\1/g;
      const listPattern = /^(\*|-)\s+(.*)/gm;

      const formattedPart = part
        .replace(titlePattern, (match, p1) => `<strong>${p1}</strong>`)
        .replace(subtitlePattern, (match, p1) => `<strong>${p1}</strong>`)
        .replace(italicPattern, (match, p1, p2) => `<em>${p2}</em>`)
        .replace(listPattern, (match, p1, p2) => `<li>${p2}</li>`);

      // Wrap list items in <ul> tags
      const wrappedList = formattedPart.replace(
        /(<li>.*<\/li>)/g,
        "<ul>$1</ul>"
      );

      return (
        <span
          key={index}
          style={{
            fontSize: "14px",
            lineHeight: "20px",
            whiteSpace: "pre-wrap",
          }}
          dangerouslySetInnerHTML={{ __html: wrappedList }}
        />
      );
    }
  });
};

const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceOpen, setSourceOpen] = useState(false);
  const [targetOpen, setTargetOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [sourceLanguage, setSourceLanguage] = useState({
    code: "spa",
    name: "Español",
    nameEn: "Spanish",
  });
  const [targetLanguage, setTargetLanguage] = useState({
    code: "eng",
    name: "English",
    nameEn: "English",
  });

  const handleCopy = () => {
    navigator.clipboard
      .writeText(translatedText)
      .then(() => {
        console.log("Text copied to clipboard");
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 3000);
      })
      .catch((err) => {
        console.error("Could not copy text: ", err);
        setIsCopied(false);
        setTimeout(() => setIsCopied(false), 3000);
      });
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    setInputText(pastedText);

    // Detect language only if there is pasted text
    if (pastedText.trim()) {
      const detectedLangCode = Object.keys(languageNameMap).find(
        (key) => languageNameMap[key] === detectLanguage(pastedText)
      );

      if (detectedLangCode) {
        const detectedLanguage = allLanguages.find(
          (lang) => lang.code === detectedLangCode
        );
        if (detectedLanguage) {
          setSourceLanguage({
            code: detectedLanguage.code,
            name: detectedLanguage.name,
            nameEn: detectedLanguage.nameEn || detectedLanguage.name,
          });
        } else {
          console.warn(
            "Detected language not found in allLanguages:",
            detectedLangCode
          );
        }
      } else {
        console.warn("Unsupported language detected.");
        // Optionally, show a message to the user
        // alert("Unsupported language detected. Please select manually.");
      }
    }
  };

  const handleTranslate = async () => {
    setLoading(true);
    try {
      const openai = new OpenAI({
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true,
      });

      const translatedContent = await TranslateText({
        openai,
        text: inputText,
        options: {
          sourceLanguage: sourceLanguage.code,
          targetLanguage: targetLanguage.code,
        },
        openaiModel: "gpt-4o-mini",
        temperature: 0.3,
      });

      setTranslatedText(translatedContent);
    } catch (error) {
      console.error("Translation error:", error);
      setTranslatedText("Error occurred during translation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="relative flex-1 w-full flex flex-col items-center justify-between">
        {/* Top Menu Bar */}
        <div className="sticky top-0 w-full border-b border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 rounded-t-lg z-10">
          <div className="max-w-screen-lg mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Mail className="w-6 h-6 text-gray-600" />
              <span className="font-semibold text-xl">Linguopro Writer</span>
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-md border border-gray-200">
                PRO
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-gray-600 text-sm font-medium hidden md:inline">
                sergio@pass.com (free)
              </span>
              <Settings className="w-5 h-5 text-gray-600 cursor-pointer hidden md:inline" />
              <button className="text-gray-500 text-base font-medium hover:text-gray-700 hidden md:inline">
                Logout
              </button>
              <Popover>
                <PopoverTrigger asChild>
                  <EllipsisVertical className="w-5 h-5 text-gray-600 cursor-pointer md:hidden" />
                </PopoverTrigger>
                <PopoverContent className="p-2 md:hidden">
                  <div className="flex flex-col">
                    <span className="px-4 text-sm font-medium text-gray-600">
                      sergio@pass.com (free)
                    </span>
                    <Separator className="my-2" />
                    <Button variant="ghost" className="w-full justify-start">
                      Settings
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      Logout
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
        <div className="w-full max-w-screen-md flex flex-col items-center bg-white gap-4">
          {/* Email Verification Alert */}
          <div className="w-full px-4 space-y-4 pt-4">
            <Alert className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                Your email is not verified. Please verify your email to access
                all features.
              </AlertDescription>
            </Alert>
          </div>
          {/* Translation Section */}
          <div className="sticky top-[52px] flex bg-white px-4 py-8 gap-2 items-center w-full justify-around md:justify-center bg-white dark:bg-gray-800 py-2">
            <LanguageSelector
              open={sourceOpen}
              setOpen={setSourceOpen}
              value={sourceLanguage}
              onChange={setSourceLanguage}
              placeholder="Idioma origen"
            />

            <Button
              variant="ghost"
              size="icon"
              className="min-w-9"
              onClick={() => {
                const temp = sourceLanguage;
                setSourceLanguage(targetLanguage);
                setTargetLanguage(temp);
              }}
            >
              <ArrowLeftRight className="h-4 w-4" />
            </Button>

            <LanguageSelector
              open={targetOpen}
              setOpen={setTargetOpen}
              value={targetLanguage}
              onChange={setTargetLanguage}
              placeholder="Idioma destino"
            />
          </div>
          {/* Response */}
          {translatedText && (
            <div className="w-full px-4 flex-1 space-y-2 overflow-y-auto">
              <Card
                className={`p-4 ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}
              >
                <div className="resize-none overflow-y-auto">
                  {renderTranslatedText(translatedText)}
                </div>
              </Card>
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopy}
                  className="h-5 w-5"
                >
                  {isCopied ? (
                    <span className="text-gray-500 mr-6">Copied</span>
                  ) : (
                    <Copy className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Input Section */}
        <div className="sticky max-w-screen-md bottom-0 bg-white py-4 z-10 w-full flex flex-col items-center gap-4 mt-auto">
          <div className="w-full bg-white z-10 px-4 space-y-4">
            <Card className="relative p-4">
              <div className="">
                <ReactTextareaAutosize
                  className={`w-full text-sm resize-none focus:outline-none ${
                    darkMode
                      ? "bg-gray-800 text-white"
                      : "bg-white text-gray-900"
                  }`}
                  placeholder="Ingresa el texto a traducir..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onPaste={handlePaste}
                  minRows={1} // Default to one sentence row size
                  maxRows={5} // Allow up to five sentence row size
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 bottom-1"
                >
                  <Mic className="h-5 w-5" />
                </Button>
              </div>
            </Card>

            <Button
              className="w-full"
              onClick={handleTranslate}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-3"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Traduciendo...
                </div>
              ) : (
                "Traducir"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
