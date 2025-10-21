# Code Runner MVP - React + TypeScript

A standalone Code Runner MVP built with React and TypeScript, extracted from the Codedang codebase as an independent application.

## Features

- **React + TypeScript**: Modern development stack with full type safety
- **Real-time Code Execution**: WebSocket-based communication with runner server
- **Interactive Terminal**: XTerm.js-powered terminal with full input/output support
- **Multi-language Support**: Python, Java, C++, JavaScript
- **IME Support**: Full support for Korean and other multi-byte character input
- **Local Storage**: Automatic code saving per language
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Hot Reload**: Vite-powered development with instant updates

## Architecture

This React version replicates the core functionality of:
- `EditorHeader.tsx` - Language selection and run controls
- `useRunner.ts` - WebSocket communication and terminal management
- Code editor with syntax highlighting and shortcuts

Built with modern React patterns:
- **Custom Hooks**: `useRunner`, `useCodeEditor`, `useToast`
- **TypeScript**: Full type safety and IntelliSense
- **Component Architecture**: Modular, reusable components
- **Vite**: Fast development and optimized builds

## Project Structure

```
codedang/run-example-react/
├── src/
│   ├── components/
│   │   ├── EditorHeader.tsx    # Header with controls
│   │   ├── CodeEditor.tsx      # Code editor component
│   │   └── Terminal.tsx        # Terminal container
│   ├── hooks/
│   │   ├── useRunner.ts        # Runner WebSocket logic
│   │   ├── useCodeEditor.ts    # Code editor state management
│   │   └── useToast.ts         # Toast notifications
│   ├── types/
│   │   └── index.ts           # TypeScript type definitions
│   ├── App.tsx                # Main application component
│   ├── App.css                # Global styles
│   └── main.tsx               # Application entry point
├── package.json               # Dependencies and scripts
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This file
```

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

```bash
cd codedang/run-example-react
npm install
```

### Configuration

Edit `src/types/index.ts` to configure your runner server:

```typescript
export const config: Config = {
  RUNNER_BASE_URL: 'ws://your-runner-server:8080', // Change this
  CONNECTION_TIME_LIMIT: 180,
  MAX_OUTPUT_LENGTH: 100000
}
```

### Development

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### Production Build

```bash
npm run build
npm run preview
```

## Usage

### Basic Operation

1. **Select Language**: Use the dropdown to choose your programming language
2. **Write Code**: Type or paste your code in the editor
3. **Run Code**: Click "Run" or press `Ctrl/Cmd + Enter`
4. **Interactive Input**: Type in the terminal to provide input to your program
5. **Save Code**: Click "Save" or press `Ctrl/Cmd + S`

### Keyboard Shortcuts

- `Ctrl/Cmd + Enter`: Run code
- `Ctrl/Cmd + S`: Save code to local storage
- `Tab`: Insert 4 spaces (in editor)
- `Ctrl + C`: Terminate running program (in terminal)

### Features

#### Advanced Code Editor
- **Tab Support**: Proper indentation with Tab key
- **Keyboard Shortcuts**: Industry-standard shortcuts
- **Auto-save**: Persistent storage per language
- **Template Loading**: Language-specific code templates

#### Real-time Terminal
- **Full XTerm.js Integration**: Complete terminal emulation
- **IME Support**: Native Korean/Asian language input
- **Multi-byte Character Support**: Proper cursor handling
- **Copy-Paste**: Multi-line paste with automatic processing
- **Output Limiting**: Prevents browser crashes (100KB limit)

#### Modern React Architecture
- **Custom Hooks**: Reusable logic with `useRunner`, `useCodeEditor`
- **TypeScript**: Full type safety and autocomplete
- **Component Composition**: Modular, testable components
- **State Management**: Efficient local state with React hooks

## Development

### Available Scripts

- `npm run dev`: Start development server with hot reload
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint
- `npm run type-check`: Run TypeScript type checking

### Adding New Languages

1. Add language to `Language` enum in `src/types/index.ts`
2. Add template to `defaultTemplates` object
3. Configure runner server to support the language

### Customizing Styles

Modify `src/App.css` for global styles or component-specific styles in individual files.

### Extending Functionality

The modular architecture makes it easy to:
- Add syntax highlighting (Monaco Editor, CodeMirror)
- Implement file management
- Add collaborative features
- Integrate with external APIs

## Technical Details

### WebSocket Protocol

Same as the vanilla version - JSON messages for code execution, input, and output.

### TypeScript Types

Full type safety with interfaces for:
- `RunnerMessage`: WebSocket message structure
- `Language`: Supported programming languages  
- `Config`: Application configuration
- Component props and hook returns

### React Patterns

- **Custom Hooks**: Encapsulate complex logic
- **Controlled Components**: Predictable state management
- **Event Handling**: Proper cleanup and memory management
- **Effect Management**: Careful dependency arrays and cleanup

### Performance Optimizations

- **Dynamic Imports**: XTerm.js loaded only when needed
- **useCallback**: Prevent unnecessary re-renders
- **Proper Cleanup**: WebSocket and event listener cleanup
- **Vite**: Fast builds and optimized bundles

## Browser Compatibility

- **Chrome/Edge**: Full support with all features
- **Firefox**: Full support
- **Safari**: Full support (macOS/iOS)
- **Mobile**: Responsive design with touch support

## Comparison with Vanilla Version

| Feature | Vanilla JS | React + TS |
|---------|------------|------------|
| Type Safety | ❌ | ✅ Full TypeScript |
| Development Experience | ⚠️ Basic | ✅ Hot reload, IntelliSense |
| Code Organization | ⚠️ Global functions | ✅ Modular components |
| State Management | ⚠️ Manual DOM | ✅ React hooks |
| Testing | ❌ Difficult | ✅ Component testing |
| Maintainability | ⚠️ Medium | ✅ High |
| Bundle Size | ✅ Smaller | ⚠️ Larger (React) |
| Performance | ✅ Fast | ✅ Fast (optimized) |

## Troubleshooting

### Common Issues

1. **WebSocket Connection**: Ensure runner server URL is correct in config
2. **Build Errors**: Run `npm run type-check` to identify TypeScript issues
3. **Terminal Not Showing**: Check browser console for XTerm.js loading errors
4. **Hot Reload Issues**: Restart dev server with `npm run dev`

### Development Tips

- Use React DevTools for component debugging
- Enable TypeScript strict mode for better type checking
- Use ESLint and Prettier for code consistency
- Test WebSocket connection separately if issues occur

## License

This React version maintains the same license terms as the original Codedang project.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with proper TypeScript types
4. Add tests if applicable
5. Submit a pull request

The React architecture makes contributions easier with:
- Clear component boundaries
- Type-safe interfaces
- Modular hook system
- Standard React patterns
