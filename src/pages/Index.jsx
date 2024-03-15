import React, { useState } from "react";
import { Box, Button, Heading, VStack, HStack, Text, IconButton, Breadcrumb, BreadcrumbItem, BreadcrumbLink, useToast, Input, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure } from "@chakra-ui/react";
import { FaFolder, FaFile, FaArrowLeft, FaArrowRight, FaPlus, FaEdit, FaTrash } from "react-icons/fa";

const Index = () => {
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderHistory, setFolderHistory] = useState([]);
  const [folderContents, setFolderContents] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newFolderName, setNewFolderName] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const openFolder = async (folder) => {
    try {
      const contents = [];
      for await (const entry of folder.values()) {
        contents.push(entry);
      }
      setFolderContents(contents);
      setCurrentFolder(folder);
      setFolderHistory([...folderHistory, folder]);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to open folder.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const goBack = () => {
    if (folderHistory.length > 1) {
      const newHistory = folderHistory.slice(0, -1);
      setFolderHistory(newHistory);
      setCurrentFolder(newHistory[newHistory.length - 1]);
    }
  };

  const goForward = () => {
    if (folderHistory.length > 1) {
      const newHistory = folderHistory.slice(0, folderHistory.length - 1);
      setFolderHistory(newHistory);
      setCurrentFolder(newHistory[newHistory.length - 1]);
    }
  };

  const createFolder = async () => {
    try {
      const newFolder = await currentFolder.getDirectoryHandle(newFolderName, { create: true });
      setFolderContents([...folderContents, newFolder]);
      setNewFolderName("");
      onClose();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to create folder.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const deleteItem = async () => {
    try {
      await selectedItem.remove();
      setFolderContents(folderContents.filter((item) => item !== selectedItem));
      setSelectedItem(null);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to delete item.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={4}>
      <Heading mb={4}>File Explorer</Heading>
      <HStack mb={4}>
        <IconButton icon={<FaArrowLeft />} onClick={goBack} disabled={folderHistory.length <= 1} aria-label="Go back" />
        <IconButton icon={<FaArrowRight />} onClick={goForward} disabled={folderHistory.length <= 1} aria-label="Go forward" />
        <Breadcrumb>
          {folderHistory.map((folder, index) => (
            <BreadcrumbItem key={index}>
              <BreadcrumbLink onClick={() => openFolder(folder)}>{folder.name}</BreadcrumbLink>
            </BreadcrumbItem>
          ))}
        </Breadcrumb>
        <Button leftIcon={<FaPlus />} onClick={onOpen}>
          New Folder
        </Button>
      </HStack>
      <VStack align="stretch" spacing={2}>
        {folderContents.map((item) => (
          <HStack key={item.name} onClick={() => setSelectedItem(item)} bg={selectedItem === item ? "gray.100" : "white"} p={2} borderRadius="md" cursor="pointer">
            {item.kind === "directory" ? <FaFolder /> : <FaFile />}
            <Text>{item.name}</Text>
          </HStack>
        ))}
      </VStack>
      {selectedItem && (
        <HStack mt={4}>
          {selectedItem.kind === "directory" && (
            <Button leftIcon={<FaFolder />} onClick={() => openFolder(selectedItem)}>
              Open
            </Button>
          )}
          <Button leftIcon={<FaEdit />} onClick={() => {}}>
            Rename
          </Button>
          <Button leftIcon={<FaTrash />} onClick={deleteItem}>
            Delete
          </Button>
        </HStack>
      )}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Folder</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input placeholder="Folder Name" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={createFolder}>
              Create
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Index;
