// // components/upload-book/HeaderSection.tsx
// import { Button } from "@/components/ui/button";
// import { BookOpen, Plus, X, Grid, List } from "lucide-react";

// interface HeaderSectionProps {
//   isFormOpen: boolean;
//   viewMode: 'grid' | 'table';
//   onToggleForm: () => void;
//   onChangeView: (mode: 'grid' | 'table') => void;
// }

// const HeaderSection = ({ isFormOpen, viewMode, onToggleForm, onChangeView }: HeaderSectionProps) => {
//   return (
//     <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-3xl border border-primary/10 shadow-2xl animate-glow w-full">
//       <div className="space-y-3">
//         <div className="flex items-center gap-4">
//           <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-2xl shadow-lg">
//             <BookOpen className="h-8 w-8 text-white animate-float" />
//           </div>
//           <div>
//             <h1 className="text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-primary bg-clip-text text-transparent">
//               Book Management
//             </h1>
//             <p className="text-xl text-muted-foreground mt-2">
//               Manage your book inventory and upload new titles
//             </p>
//           </div>
//         </div>
//       </div>
      
//       <div className="flex flex-col sm:flex-row gap-4">
//         <div className="flex bg-muted/50 rounded-2xl p-2 border">
//           <Button
//             variant={viewMode === 'grid' ? 'default' : 'ghost'}
//             size="sm"
//             onClick={() => onChangeView('grid')}
//             className="flex items-center gap-2 transition-all duration-300"
//           >
//             <Grid className="h-4 w-4" />
//             Grid
//           </Button>
//           <Button
//             variant={viewMode === 'table' ? 'default' : 'ghost'}
//             size="sm"
//             onClick={() => onChangeView('table')}
//             className="flex items-center gap-2 transition-all duration-300"
//           >
//             <List className="h-4 w-4" />
//             Table
//           </Button>
//         </div>
        
//         <Button
//           onClick={onToggleForm}
//           className="h-12 px-8 text-lg font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary border-0 min-w-[200px]"
//         >
//           {isFormOpen ? (
//             <>
//               <X className="h-5 w-5 mr-2" />
//               Close Form
//             </>
//           ) : (
//             <>
//               <Plus className="h-5 w-5 mr-2" />
//               Upload New Book
//             </>
//           )}
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default HeaderSection;