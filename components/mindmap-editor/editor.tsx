"use client";
import ImgPikaIcon from "@/public/pika.png";
import ImgPikachu from "@/public/pikachu.png";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  Edge,
  Panel,
  useKeyPress,
  OnEdgeUpdateFunc,
  updateEdge,
  SelectionMode,
} from "reactflow";
import "reactflow/dist/style.css";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/components/mindmap-editor";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import useMousePosition from "@/components/hooks/use-mouse-position";
import { FiPlus } from "react-icons/fi";
import { MdOutlineDelete } from "react-icons/md";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { BasicNode } from "./basic-node";
import "reactflow/dist/style.css";

const nodeTypes = { basic: BasicNode };

export function Editor() {
  const {
    nodes,
    edges,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    createNode,
    deleteAllNodes,
  } = useSettings();

  const [isPikaVisible, setPika] = useState<boolean>(false);

  const isNPressed = useKeyPress("n");
  const position = useMousePosition();

  useEffect(() => {
    if (!isNPressed) return;
    createNode(position);
  }, [isNPressed]);

  const edgeUpdateSuccessful = useRef(true);

  const onEdgeUpdateStart = useCallback(() => {
    edgeUpdateSuccessful.current = false;
  }, []);

  const onEdgeUpdate: OnEdgeUpdateFunc<any> = useCallback(
    (oldEdge, newConnection) => {
      edgeUpdateSuccessful.current = true;
      setEdges((els) => updateEdge(oldEdge, newConnection, els));
    },
    [],
  );

  const onEdgeUpdateEnd = useCallback((_: any, edge: Edge<any>) => {
    if (!edgeUpdateSuccessful.current) {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    }

    edgeUpdateSuccessful.current = true;
  }, []);

  const [palatteOpen, setPalatteOpen] = React.useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "p" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        console.log("ok");
        setPalatteOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onEdgeUpdate={onEdgeUpdate}
      onEdgeUpdateStart={onEdgeUpdateStart}
      onEdgeUpdateEnd={onEdgeUpdateEnd}
      proOptions={{ hideAttribution: true }}
      selectionOnDrag
      selectionMode={SelectionMode.Partial}
    >
      <Controls />
      <Panel position="top-right">
        <div className="flex w-full h-full items-center justify-end gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPika((x) => !x)}
          >
            <img src={ImgPikaIcon.src} height={16} width={16} />
          </Button>
          <Button onClick={() => createNode()} variant="outline" size="icon">
            <FiPlus size={18} />
          </Button>
          <Dialog>
            <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 h-9 w-9">
              <MdOutlineDelete size={18} />
            </DialogTrigger>
            <DialogContent>
              <DialogHeader className="space-y-4">
                <DialogTitle>
                  Are you sure you want to delete all nodes?
                </DialogTitle>
                <DialogDescription>
                  This will delete all your nodes.
                </DialogDescription>
                <DialogFooter>
                  <DialogClose className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 hover:bg-accent hover:text-accent-foreground">
                    Cancel
                  </DialogClose>
                  <DialogClose
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90"
                    onClick={() => deleteAllNodes()}
                  >
                    Delete all
                  </DialogClose>
                </DialogFooter>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
        {isPikaVisible ? <img src={ImgPikachu.src} /> : <></>}

        {/* <Button variant={"outline"} onClick={toggleEditMode}>
              {onEditMode ? "edit" : "read"}
            </Button> */}
      </Panel>
      <Panel position="bottom-right">
        {nodes.length === 0 ? (
          <div className="space-y-4 pr-4 pb-6">
            <Alert>
              <AlertTitle>Pro Tip:</AlertTitle>
              <AlertDescription>
                Press{" "}
                <kbd className="pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono font-medium opacity-100">
                  Ctrl
                </kbd>{" "}
                +
                <kbd className="pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono font-medium opacity-100">
                  P
                </kbd>{" "}
                to open command palatte.
              </AlertDescription>
            </Alert>
            <Alert>
              <AlertTitle>Quick Tip:</AlertTitle>
              <AlertDescription>
                Press{" "}
                <kbd className="pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono font-medium opacity-100">
                  N
                </kbd>{" "}
                to add new nodes quickly.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <MiniMap />
        )}
      </Panel>
      <Background variant={BackgroundVariant.Dots} gap={12} size={1} />

      <CommandDialog open={palatteOpen} onOpenChange={setPalatteOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>Add node</CommandItem>
          </CommandGroup>
          <CommandGroup heading="Delete">
            <CommandItem>Delete all nodes</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </ReactFlow>
  );
}
